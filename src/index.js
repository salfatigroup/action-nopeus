const os = require("os")
const fs = require("fs")
const core = require("@actions/core")
const path = require("path")
const childProcess = require("child_process")

// get the user inputs args
const inputs = {
	releaseVersion: core.getInput("release_version"),
	nopeusConfig: path.join(process.env.GITHUB_WORKSPACE, core.getInput("nopeusConfig") || "nopeus.yaml"),
	nopeusToken: process.env.NOPEUS_TOKEN,
	disableCache: core.getInput("disable_cache") === "true",
	awsAccessKeyId: core.getInput("aws_access_key_id"),
	awsSecretAccessKey: core.getInput("aws_secret_access_key"),
}

// action entrypoint
function run() {
	core.debug("inputs: " + JSON.stringify(inputs))
	// install the nopeus binary
	installNopeus()

	// setup credentials
	core.debug("setting up credentials")
	setupCredentials()

	// upgrade release version if needed
	if (inputs.releaseVersion) {
		overrideNopeusReleaseVersion(nopeusConfig, inputs.releaseVersion)
	}

	// build the nopeus liftoff command
	const cmd = [`${os.homedir()}/nopeus/nopeus`, 'liftoff', '-c', inputs.nopeusConfig]
	// if (inputs.nopeusToken) {
	// 	core.debug("adding nopeus token")
	// 	cmd.push('-t', inputs.nopeusToken)
	// }
	core.debug("cmd: " + cmd.join(" "))

	// run the liftoff command
	core.debug("running liftoff")
	childProcess.execSync(cmd.join(" "), { stdio: "inherit" })
	console.log('nopeus liftoff complete')
}

function setupCredentials() {
	// setup aws credentials
	if (inputs.awsAccessKeyId && inputs.awsSecretAccessKey) {
		// create the .aws directory if it doesn't exist
		if (!fs.existsSync(path.join(os.homedir(), ".aws"))) {
			core.debug("creating .aws directory")
			fs.mkdirSync(path.join(os.homedir(), ".aws"))
		}
		// write aws credentials to ~/.aws/credentials
		const credentialsFile = path.join(os.homedir(), ".aws", "credentials")
		core.debug("writing aws credentials to " + credentialsFile)
		fs.writeFileSync(credentialsFile, `[default]\naws_access_key_id = ${inputs.awsAccessKeyId}\naws_secret_access_key = ${inputs.awsSecretAccessKey}`)
	}
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
	childProcess.execSync("sudo apt-get update", { stdio: "inherit" })
	childProcess.execSync("sudo apt-get install -y jq", { stdio: "inherit" })

	core.debug("installing nopeus binary")
	// install nopeus
	cmd = `curl -sfL https://cdn.salfati.group/nopeus/install.sh | bash`
	childProcess.execSync(cmd, { stdio: "inherit" })
	core.debug("installation complete")
}

// run nopeus liftoff
run()
