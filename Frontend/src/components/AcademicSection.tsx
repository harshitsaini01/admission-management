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
  const getFieldNameBase = (title: string) => {
    switch (title.toLowerCase()) {
      case "highschool":
        return "highSchool";
      case "intermediate":
        return "intermediate";
      case "graduation":
        return "graduation";
      case "other":
        return "other";
      default:
        return title.toLowerCase(); // Fallback (shouldn’t hit this)
    }
  };

  const baseName = getFieldNameBase(title);

  return (
    <div className="grid grid-cols-8 gap-5 mb-4">
      <div>
        <h2 className="block text-sm mt-3 font-medium text-gray-700">{title}{required && "*"}</h2>
      </div>
      <InputField
        label={required ? "Subject*" : "Subject"}
        name={`${baseName}Subject`}
        value={formData[`${baseName}Subject`]}
        onChange={onChange}
        placeholder="Subjects"
        required={required}
      />
      <InputField
        label={required ? "Year*" : "Year"}
        name={`${baseName}Year`}
        value={formData[`${baseName}Year`]}
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
        name={`${baseName}Board`}
        value={formData[`${baseName}Board`]}
        onChange={onChange}
        placeholder="BOARD/UNIVERSITY"
        required={required}
      />
      <InputField
        label={required ? "Obtained Marks*" : "Obtained Marks"}
        name={`${baseName}ObtainedMarks`}
        value={formData[`${baseName}ObtainedMarks`]}
        onChange={onChange}
        required={required}
      />
      <InputField
        label={required ? "Maximum Marks*" : "Maximum Marks"}
        name={`${baseName}MaximumMarks`}
        value={formData[`${baseName}MaximumMarks`]}
        onChange={onChange}
        required={required}
      />
      <InputField
        label={required ? "Percentage/Grade*" : "Percentage/Grade"}
        name={`${baseName}Percentage`}
        value={formData[`${baseName}Percentage`]}
        onChange={onChange}
        placeholder="%"
        required={required}
      />
      <FileUpload
        label={required ? "Marksheet*" : "Marksheet"}
        name={`${baseName}Marksheet`}
        file={files[`${baseName}Marksheet`]}
        onChange={onFileChange}
        required={required}
      />
    </div>
  );
};

export default AcademicSection;