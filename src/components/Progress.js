import React from "react";

const Progress = ({ value }) => {
  return (
    <div className="w-full bg-gray-200 rounded-full h-3">
      <div
        className="bg-green-500 h-3 rounded-full"
        style={{ width: `${value}%`, transition: "width 0.3s ease" }}
      />
    </div>
  );
};

export default Progress;
