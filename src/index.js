const os = require("os")
const fs = require("fs")
const core = require("@actions/core")
const path = require("path")
const childProcess = require("child_process")
const YAML = require("yaml")

// get the user inputs args
const inputs = {
	releaseVersion: core.getInput("release_version"),
  environmentsToDeploy: core.getInput("environments"),
	nopeusConfig: path.join(process.env.GITHUB_WORKSPACE, core.getInput("nopeusConfig") || "nopeus.yaml"),
	nopeusToken: process.env.NOPEUS_TOKEN,
	downloadToken: process.env.NOPEUS_DOWNLOAD_KEY,
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

  // delete any environments from the nopeus yaml that do not exists
  // in the environmentsToDeploy value
  if (inputs.environmentsToDeploy) {
    // split and clean the environmentsToDeploy value
    const environmentsToDeploy = inputs.environmentsToDeploy.split(",").map(env => env.trim()).filter(env => env)
    updateEnvironments(environmentsToDeploy)
  }

	// build the nopeus liftoff command
	const cmd = [`${os.homedir()}/nopeus/nopeus`, 'liftoff', '-c', inputs.nopeusConfig]
	if (inputs.nopeusToken) {
		core.debug("adding nopeus token")
		cmd.push('-t', inputs.nopeusToken)
	}
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

// remove environments from nopeus.yaml that do not exists
// in the provided environments
function updateEnvironments(nopeusConfigPath, environments) {
  core.debug("overriding nopeus environments")
  // read the nopeus.yaml file
  const nopeusConfigContent = fs.readFileSync(nopeusConfigPath, "utf8")
  // parse the configuration
  const nopeusConfig = YAML.parse(nopeusConfigContent)
  // remove environments that do not exists in the environments value
  const environmentsToRemove = nopeusConfig.environments.filter(env => !environments.includes(env.name))
  // remove the environments from the nopeus.yaml file
  environmentsToRemove.forEach(env => {
    delete nopeusConfig.environments[env.name]
  })

  // write the nopeus.yaml file
  fs.writeFileSync(nopeusConfigPath, YAML.stringify(nopeusConfig))
}

// install the nopeus binary
function installNopeus() {
	// install jq
	core.debug("installing jq")
	childProcess.execSync("sudo apt-get update", { stdio: "inherit" })
	childProcess.execSync("sudo apt-get install -y jq", { stdio: "inherit" })

	core.debug("installing nopeus binary")
	// install nopeus
	cmd = `curl -sfL https://cdn.salfati.group/nopeus/install.sh | NOPEUS_TOKEN=${inputs.downloadToken} bash`
	childProcess.execSync(cmd, { stdio: "inherit" })
	core.debug("installation complete")
}

// run nopeus liftoff
run()
