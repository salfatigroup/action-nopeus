const core = require("@actions/core")
const path = require("path")
const childProcess = require("child_process")

// get the user inputs args
const inputs = {
	releaseVersion: core.getInput("release_version"),
	nopeusConfig: path.join(process.env.GITHUB_WORKSPACE, core.getInput("nopeusConfig") || "nopeus.yaml"),
	nopeusToken: process.env.NOPEUS_TOKEN,
}

// action entrypoint
function run() {
	// install the nopeus binary
	installNopeus()

	// upgrade release version if needed
	if (inputs.releaseVersion) {
		overrideNopeusReleaseVersion(nopeusConfig, inputs.releaseVersion)
	}

	// build the nopeus liftoff command
	const cmd = ['nopeus', 'liftoff', '-c', inputs.nopeusConfig]
	if (inputs.nopeusToken) {
		cmd.push('-t', inputs.nopeusToken)
	}

	// run the liftoff command
	childProcess.execSync(cmd.join(" "), { stdio: "inherit" })
}

// override the nopeus release version
function overrideNopeusReleaseVersion(nopeusConfig, releaseVersion) {
	const nopeusConfigContent = fs.readFileSync(nopeusConfig, "utf8")
	const nopeusConfigContentWithReleaseVersion = nopeusConfigContent.replace(/^version:.*$/m, `version: ${releaseVersion}`)
	fs.writeFileSync(nopeusConfig, nopeusConfigContentWithReleaseVersion)
}

// install the nopeus binary
function installNopeus() {
	const cmd = ["curl", "-sfL", "https://nopeus.co/static/install.sh", "|", "bash"]
	childProcess.execSync(cmd.join(" "), { stdio: "inherit" })
}

// run nopeus liftoff
run()
