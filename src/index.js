const assert = require("assert");
const debug = require("debug");
const { writeFileSync } = require("fs");

assert.ok(process.env.PETIBRUGNON_INPUT_JSON_FILE_PATH);

const input = require(process.env.PETIBRUGNON_INPUT_JSON_FILE_PATH);
const logger = debug("root");

/**
 * @param {{ name: string, people: string[] }[]} input
 * @returns {string}
 */
function formatSolution(solution) {
    const projectLines = solution.flatMap(({ name, people }) => [
        name,
        people.join(" "),
    ]);
    return [Number(solution.length || 0), ...projectLines].join("\n");
}

function writeOutput(content) {
    writeFileSync(process.env.PETIBRUGNON_OUTPUT_FILE_PATH, content);
}

const contributorsBySkill = {}
for (const contributor of input.contributors) {
    contributor.available = 0;
    for (const skill of contributor.skills) {
        if (!contributorsBySkill[skill.name]) {
            contributorsBySkill[skill.name] = [{ contributor, skill }];
        } else {
            contributorsBySkill[skill.name].push({ contributor, skill });
        }
    }
}


logger(JSON.stringify(contributorsBySkill));

function sortProjects(projects) {
    return projects.sort((a, b) => b.ndays - a.ndays);
    // return projects.sort((a, b) => b.bestBefore - a.bestBefore);
    //return projects.sort((a, b) => a.score - b.score);
}

const solution = [];
const projectsRemainded = new Set(input.projects.map(({ name }) => name));
let step = 0;
while(projectsRemainded.size > 0) {
    debug(step);
    const candidates = new Set();
    for (const project of sortProjects(input.projects)) {
        if (!projectsRemainded.has(project.name)) continue;
        let projectStartDate = 0;
        const cast = [];
        const castSet = new Set();
        for (let skill of project.skills) {
            const candidate = contributorsBySkill[skill.name]
                .filter(c => !castSet.has(c.contributor.name) && !candidates.has(c.contributor.name))
                .filter(c => c.skill.level >= skill.level)
                .sort((a, b) => b.contributor.available - a.contributor.available)
                [0];
            if (candidate) {
                cast.push(candidate);
                castSet.add(candidate.contributor.name);
                projectStartDate = Math.max(projectStartDate, candidate.contributor.available);
            }
        }
        if (cast.length == project.nroles) {
            projectsRemainded.delete(project.name);
            solution.push({ name: project.name, people: [...cast.map(({ contributor :{ name }} ) => name)] });
            cast.forEach(({ contributor, skill }) => {
                contributor.available = projectStartDate + project.ndays;
                if (skill.level == project.skills.find(s => s.name == skill.name).level) {
                    skill.level++;
                }
                candidates.add(contributor.name);
            });
        }
    }
    if (candidates.size == 0) {
        break;
    }
}

//logger(JSON.stringify(solution));


writeOutput(formatSolution(solution));
