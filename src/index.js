const os = require("os")
const core = require("@actions/core")
const path = require("path")
const childProcess = require("child_process")

// get the user inputs args
const inputs = {
	releaseVersion: core.getInput("release_version"),
	nopeusConfig: path.join(process.env.GITHUB_WORKSPACE, core.getInput("nopeusConfig") || "nopeus.yaml"),
	nopeusToken: process.env.NOPEUS_TOKEN,
	disableCache: core.getInput("disable_cache") === "true"
}

// action entrypoint
function run() {
	core.debug("inputs: " + JSON.stringify(inputs))
	// install the nopeus binary
	installNopeus()

	// upgrade release version if needed
	if (inputs.releaseVersion) {
		overrideNopeusReleaseVersion(nopeusConfig, inputs.releaseVersion)
	}

	// build the nopeus liftoff command
	const cmd = [`${os.homedir()}/nopeus/nopeus`, 'liftoff', '-c', inputs.nopeusConfig]
	core.debug("cmd: " + cmd.join(" "))
	if (inputs.nopeusToken) {
		core.debug("adding nopeus token")
		cmd.push('-t', inputs.nopeusToken)
	}

	// run the liftoff command
	core.debug("running liftoff")
	childProcess.execSync(cmd.join(" "), { stdio: "inherit" })
	console.log('nopeus liftoff complete')
}

// override the nopeus release version
function overrideNopeusReleaseVersion(nopeusConfig, releaseVersion) {
	core.debug("overriding nopeus release version")
	const nopeusConfigContent = fs.readFileSync(nopeusConfig, "utf8")
	const nopeusConfigContentWithReleaseVersion = nopeusConfigContent.replace(/^version:.*$/m, `version: ${releaseVersion}`)
	fs.writeFileSync(nopeusConfig, nopeusConfigContentWithReleaseVersion)
	core.debug(fs.readFileSync(nopeusConfig, "utf8"))
}

// install the nopeus binary
function installNopeus() {
	// install jq
	core.debug("installing jq")
	childProcess.execSync("apt-get update", { stdio: "inherit" })
	childProcess.execSync("apt-get install -y jq", { stdio: "inherit" })

	core.debug("installing nopeus binary")
	// install nopeus
	cmd = `curl -sfL https://cdn.salfati.group/nopeus/install.sh | bash`
	childProcess.execSync(cmd, { stdio: "inherit" })
	core.debug("installation complete")
}

// run nopeus liftoff
run()
