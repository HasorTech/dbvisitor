const {version: lastReleaseVer, lastReleaseTime} = require('../package.json');

function releaseNotesPath(version) {
    return `./${version.split('.')[0]}.x/v${version.replace(/-SNAPSHOT$/, '')}.md`;
}

const projectVars = {
    lastReleaseVer,
    lastReleaseNotesPath: releaseNotesPath(lastReleaseVer),
    lastReleaseTime
};

function replaceVariables(value) {
    return value.replace(/@project\.([A-Za-z][A-Za-z0-9_]*)@/g, (token, name) => {
        if (!Object.hasOwn(projectVars, name) || typeof projectVars[name] !== 'string') {
            throw new Error(`Unknown or invalid project variable: ${token}`);
        }
        return projectVars[name];
    });
}

module.exports = {projectVars, replaceVariables};
