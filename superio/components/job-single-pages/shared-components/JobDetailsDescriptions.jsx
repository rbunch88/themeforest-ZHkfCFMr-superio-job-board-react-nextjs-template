// Accept job data as a prop
const JobDetailsDescriptions = ({ job }) => {
  // Basic check if job data is available
  if (!job) {
    return <div className="job-detail">Loading job details...</div>;
  }

  return (
    <div className="job-detail">
      {/* Display fetched job description */}
      {job.description && (
        <>
          <h4>Job Description</h4>
          {/* Use dangerouslySetInnerHTML if description contains HTML, otherwise just render */}
          {/* Assuming plain text for now */}
          <p>{job.description}</p>
        </>
      )}

      {/* Display fetched responsibilities if available */}
      {job.responsibilities && job.responsibilities.length > 0 && (
        <>
          <h4>Key Responsibilities</h4>
          <ul className="list-style-three">
            {job.responsibilities.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </>
      )}

      {/* Display fetched requirements (qualifications) if available */}
      {job.requirements && job.requirements.length > 0 && (
        <>
          <h4>Skill & Experience (Requirements)</h4>
          <ul className="list-style-three">
            {job.requirements.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </>
      )}

      {/* TODO: Consider adding 'preferred_qualifications' if that field exists and is fetched */}

    </div>
  );
};

export default JobDetailsDescriptions;
