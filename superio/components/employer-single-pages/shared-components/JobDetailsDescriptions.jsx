// Removed GalleryBox import as it's not used here

// Accept employer data as a prop
const JobDetailsDescriptions = ({ description }) => {

  // Basic check if description data is available
  if (!description) {
    return (
        <div className="job-detail">
            <h4>About Company</h4>
            <p>No description provided.</p>
        </div>
    );
  }

  return (
    <div className="job-detail">
      <h4>About Company</h4>
      {/* Assuming description is plain text. Use dangerouslySetInnerHTML if it contains HTML */}
      <p>{description}</p>

      {/* Removed static text and GalleryBox */}
    </div>
  );
};

export default JobDetailsDescriptions;
