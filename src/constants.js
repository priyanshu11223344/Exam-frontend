
export const BOARDS = [
    { id: 'cambridge', name: 'Cambridge Assessment' },
    { id: 'edexcel', name: 'Pearson Edexcel' },
    { id: 'aqa', name: 'AQA' },
    { id: 'ib', name: 'International Baccalaureate' },
  ];
  
  export const SUBJECTS = [
    { id: 's1', boardId: 'cambridge', name: 'Physics', numberOfPapers: 6 },
    { id: 's2', boardId: 'cambridge', name: 'Mathematics', numberOfPapers: 7 },
    { id: 's3', boardId: 'edexcel', name: 'Chemistry', numberOfPapers: 6 },
    { id: 's4', boardId: 'aqa', name: 'Biology', numberOfPapers: 5 },
  ];
  
  export const TOPICS = [
    { id: 't1', subjectId: 's1', name: 'Kinematics' },
    { id: 't2', subjectId: 's1', name: 'Dynamics' },
    { id: 't3', subjectId: 's1', name: 'Quantum Physics' },
    { id: 't4', subjectId: 's2', name: 'Calculus' },
    { id: 't5', subjectId: 's2', name: 'Probability' },
  ];
  
  export const MOCK_RESOURCES = [
    {
      id: 'res-1',
      topicId: 't1',
      year: 2023,
      season: 'Summer',
      paperNumber: 1,
      variant: 2,
      title: 'Kinematics - Linear Motion Problems',
      questionUrl: 'https://picsum.photos/seed/q1/800/600',
      markSchemeUrl: 'https://picsum.photos/seed/m1/800/600',
      explanationUrl: 'https://picsum.photos/seed/e1/800/600',
      commentsUrl: 'https://picsum.photos/seed/c1/800/600',
    },
    {
      id: 'res-2',
      topicId: 't1',
      year: 2022,
      season: 'Winter',
      paperNumber: 2,
      variant: 1,
      title: 'Projectile Motion Analysis',
      questionUrl: 'https://picsum.photos/seed/q2/800/600',
      markSchemeUrl: 'https://picsum.photos/seed/m2/800/600',
      explanationUrl: 'https://picsum.photos/seed/e2/800/600',
    },
    {
      id: 'res-3',
      topicId: 't3',
      year: 2023,
      season: 'Summer',
      paperNumber: 4,
      variant: 2,
      title: 'Photoelectric Effect Investigation',
      questionUrl: 'https://picsum.photos/seed/q3/800/600',
      markSchemeUrl: 'https://picsum.photos/seed/m3/800/600',
      explanationUrl: 'https://picsum.photos/seed/e3/800/600',
      commentsUrl: 'https://picsum.photos/seed/c3/800/600',
    },
  ];
  export const years = [];

for (let i = 1990; i <= 2026; i++) {
  years.push(i);
}
