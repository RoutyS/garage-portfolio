// Technologies are matched against declared skills, never company names.
export const searchKey = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('fr').replace(/[^a-z0-9]/g, '');

export function matchesTechnology(project, technology) {
  const skills = project.tech.map(searchKey);
  if (technology === 'all') return true;
  if (technology === 'unity') return skills.some(skill => /^unity(?:engine)?[0-9.]*$/.test(skill));
  if (technology === 'unreal') return skills.some(skill => /^unreal(?:engine)?[0-9.]*$/.test(skill));
  if (technology === 'ar') return skills.some(skill => ['ar', 'realiteaugmentee', 'augmentedreality'].includes(skill));
  return false;
}

export function filterProjects(projects, {category = 'all', technology = 'all', query = ''} = {}) {
  const needle = searchKey(query);
  return projects.filter(project => {
    const categoryMatches = category === 'all' || project.category === category
      || category === 'code' && ['ai', 'simulation'].includes(project.category)
      || category === 'playable' && project.category === 'game' && (project.video || project.videoPending || project.externalVideo);
    const text = [project.name, project.summary, project.context || '', ...project.tech].join(' ');
    return categoryMatches && matchesTechnology(project, technology) && searchKey(text).includes(needle);
  });
}
