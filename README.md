# Automated Radiology Reporting with SMART on FHIR

Welcome to Project 11 of course COMP3820. Our application focuses on automating radiology reporting from chest X-rays using multimodal models and FHIR integration. This application simplifies the process of managing patient data and medical imaging, utilizing an AI-based API to generate findings and impressions for chest X-rays.

## Getting Started

To begin, follow these steps:

1. **Run the Docker Image**: Launch the AI-based API server using Docker, which will be hosted on port 8080. The API will be used on port 3000.

   ```shell
   sh run.sh
   ```

2. **Host the Website**: Locally host the SMART on FHIR application.

   - Install dependencies:

     ```shell
     yarn install
     ```

   - Start the application:

     ```shell
     yarn start
     ```

3. **Access SMART on FHIR Launcher**: Visit [SMART Launcher](https://launch.smarthealthit.org/).

   - Keep the default settings and adjust the launch URL to `http://localhost:3000` at the form's bottom.

   - Click "Launch."

## Workflow

Follow this workflow within the SMART on FHIR Starter Kit:

1. **Fetch Patient Data**: The application retrieves patient FHIR data.

2. **Visualize Patient Information**: View patient details using the FHIR Visualizer.

3. **Modify Patient Information**: Modify patient records as necessary.

4. **AI-Powered Imaging**: Upload DICOM images to receive AI-generated findings and impressions from the AI Server (API Report).

5. **X-Ray Viewing**: Choose your preferred view of X-ray images from the report.

6. **Create Observations with LOINC Codes**: Generate observations for findings and associate them with LOINC codes.

7. **Generate Reports**: Quickly generate reports based on observations and AI-generated impressions.

## Next Steps

This starter kit provides a robust foundation for developing SMART on FHIR applications. You can use it to create advanced applications such as ML-assisted image analysis tools.

## References

For additional resources and guides, refer to the following:

- [Create React App](https://github.com/facebook/create-react-app): The project is bootstrapped with this tool.

- [Quickstart on deploying a SMART app in Azure](https://docs.microsoft.com/en-us/azure/healthcare-apis/azure-api-for-fhir/use-smart-on-fhir-proxy).

- [SMARTHealth Quickstart](https://docs.smarthealthit.org/).

- [Cerner Quickstart](https://engineering.cerner.com/smart-on-fhir-tutorial/).

## Achievements

With this project, you can:

- Efficiently query and modify patient information, making it easy for researchers to access and update patient data.

- Utilize advanced AI technology for in-depth analysis of X-ray images, assisting healthcare professionals in identifying disease signs.

- Support report generation and sharing, providing a convenient solution for accessing detailed diagnostic reports.

## Contributing

Contributions and suggestions are welcome. Please review and agree to the [Contributor License Agreement (CLA)](https://cla.opensource.microsoft.com) before submitting contributions.

The project follows the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct). For inquiries or additional information, contact [opencode@microsoft.com](mailto:opencode@microsoft.com).

## Trademarks

Usage of Microsoft trademarks or logos must adhere to [Microsoft's Trademark & Brand Guidelines](https://www.microsoft.com/en-us/legal/intellectualproperty/trademarks/usage/general). Usage of third-party trademarks or logos is subject to their respective policies.

## Additional Information

- **Docker Image I/O**:
  - Input: DICOM or PNG images.
  - Output: JSON output with findings and impression section fields.

- **Example requests using `curl` for DICOM images**:

  ```shell
  curl --location '127.0.0.1:3000/dicom_to_report' --form 'input_file=@"./example.dcm"'
  ```

- **Example requests using `curl` for PNG images**:

  ```shell
  curl --location '127.0.0.1:3000/image_to_report' --form 'input_file=@"./example.png"'
  ```

- **Additional Information**:
  - The Docker image requires GPU resources, such as an NVIDIA RTX 3090 (2GB of VRAM) and 3.3GB of RAM.
  - The model used is [aehrc/cxrmate-single-tf](https://huggingface.co/aehrc/cxrmate-single-tf).
  - For more advanced model options, refer to the provided resources.
