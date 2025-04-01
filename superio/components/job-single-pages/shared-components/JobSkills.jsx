// Accept job data as a prop
const JobSkills = ({ job }) => {
  // Use the jobSkills array from the job prop, default to empty array if not present
  const skills = job?.jobSkills || [];

  // Don't render the component if there are no skills
  if (skills.length === 0) {
    return null;
  }

  return (
    <ul className="job-skills">
      {skills.map((skill, i) => (
        <li key={i}>
          {/* Link might not be necessary here, could just be text */}
          {/* <a href="#">{skill}</a> */}
          <span>{skill}</span>
        </li>
      ))}
    </ul>
  );
};

export default JobSkills;
