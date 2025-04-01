// Accept skills array as a prop
const JobSkills = ({ skills }) => {
  // Use the passed skills array, default to empty array if not provided
  const skillsList = skills || [];

  // Don't render the component if there are no skills
  if (skillsList.length === 0) {
    return null;
  }

  return (
    <ul className="job-skills">
      {skillsList.map((skill, i) => (
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
