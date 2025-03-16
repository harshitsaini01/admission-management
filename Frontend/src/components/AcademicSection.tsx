import React from "react";
import InputField from "./InputField";
import FileUpload from "./FileUpload";

type AcademicSectionProps = {
  title: string;
  formData: Record<string, string>;
  files: Record<string, File | null>;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
};

const AcademicSection: React.FC<AcademicSectionProps> = ({
  title,
  formData,
  files,
  onChange,
  onFileChange,
  required = false,
}) => {
  // Map title to correct camelCase field names
  const getFieldName = (title: string) => {
    switch (title.toLowerCase()) {
      case "highschool":
        return "highSchoolMarksheet";
      case "intermediate":
        return "intermediateMarksheet";
      case "graduation":
        return "graduationMarksheet";
      case "other":
        return "otherMarksheet";
      default:
        return `${title.toLowerCase()}Marksheet`; // Fallback (shouldn’t hit this)
    }
  };

  return (
    <div className="grid grid-cols-8 gap-5 mb-4">
      <div>
        <h2 className="block text-sm mt-3 font-medium text-gray-700">{title}{required && "*"}</h2>
      </div>
      <InputField
        label={required ? "Subject*" : "Subject"}
        name={`${title.toLowerCase()}Subject`}
        value={formData[`${title.toLowerCase()}Subject`]}
        onChange={onChange}
        placeholder="Subjects"
        required={required}
      />
      <InputField
        label={required ? "Year*" : "Year"}
        name={`${title.toLowerCase()}Year`}
        value={formData[`${title.toLowerCase()}Year`]}
        onChange={onChange}
        type="select"
        options={[
          { value: "2020", label: "2020" },
          { value: "2021", label: "2021" },
          { value: "2022", label: "2022" },
        ]}
        placeholder="Select Year"
        required={required}
      />
      <InputField
        label={required ? "Board/University*" : "Board/University"}
        name={`${title.toLowerCase()}Board`}
        value={formData[`${title.toLowerCase()}Board`]}
        onChange={onChange}
        placeholder="BOARD/UNIVERSITY"
        required={required}
      />
      <InputField
        label={required ? "Obtained Marks*" : "Obtained Marks"}
        name={`${title.toLowerCase()}ObtainedMarks`}
        value={formData[`${title.toLowerCase()}ObtainedMarks`]}
        onChange={onChange}
        required={required}
      />
      <InputField
        label={required ? "Maximum Marks*" : "Maximum Marks"}
        name={`${title.toLowerCase()}MaximumMarks`}
        value={formData[`${title.toLowerCase()}MaximumMarks`]}
        onChange={onChange}
        required={required}
      />
      <InputField
        label={required ? "Percentage/Grade*" : "Percentage/Grade"}
        name={`${title.toLowerCase()}Percentage`}
        value={formData[`${title.toLowerCase()}Percentage`]}
        onChange={onChange}
        placeholder="%"
        required={required}
      />
      <FileUpload
        label={required ? "Marksheet*" : "Marksheet"}
        name={getFieldName(title)} // Use corrected field name
        file={files[getFieldName(title)]}
        onChange={onFileChange}
        required={required}
      />
    </div>
  );
};

export default AcademicSection;