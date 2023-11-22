import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import { PatientVisualizer } from 'fhir-visualizers';
import { useForm } from "react-hook-form";
import { Spinner, Container, Button, Form, Dropdown } from "react-bootstrap";

export default function App(props) {
  const client = props.client;
  const [patient, setPatient] = useState(null);
  const [reportId, setReportId] = useState('');
  const [observationId, setObservationId] = useState('');
  const [selectedViewCode, setSelectedViewCode] = useState({label:'Select X-Ray View'});
  const [createdObservationId, setCreatedObservationId] = useState('');
  const [reportIds, setReportIds] = useState([]);
  const [selectedReportId, setSelectedReportId] = useState('');


  const reports = useRef(null);
  const observation = useRef(null);
  const isDeletingReport = useRef(false);
  const isCreatingReport = useRef(false);
  const isCreatingObservation = useRef(false);
  const isViewingObservation = useRef(false);
  const isViewingObservations = useRef(false);
  const aiReport = useRef(null);
  const stepStatus = useRef({
    step1: false,
    step2: false,
    step3: false,
    step4: false,
  });

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  const getReports = () => {
    client.patient.request("DiagnosticReport")
      .then(response => {
        let studies = response.entry.map(entry => entry.resource);
        reports.current = studies;
        setReportIds(studies.map(study => study.id));
      })
  }

  async function getReportsWait() {
    await delay(1000);
    getReports();
  }

  const getObservations = () => {
    client.patient.request("Observation")
      .then(response => {
        let observations = response.entry.map(entry => entry.resource);
        console.log(observations);
      })
  }

  const getObservation = () => {
    client.request(`Observation?_id=${observationId}`)
      .then(response => {
        if (response.entry === undefined) {
          observation.current = null;
          return;
        }
        let observations = response.entry.map(entry => entry.resource);
        observation.current = observations;
      })
  }

  const handleSelect = (view) => {
    let loinc = view.split(',');
    loinc = {
      label: loinc[0],
      loinc: loinc[1],
    }
    setSelectedViewCode(loinc);
    stepStatus.current.step2 = true;
  };

  const dropdownViews = [
    { label: 'XR Chest AP', loinc: '36572-6' },
    { label: 'XR Chest AP and Lateral', loinc: '36687-2' },
    { label: 'XR Chest PA and Lateral', loinc: '42272-5' },
    { label: 'XR Chest PA and Lateral and Oblique', loinc: '30744-7' },
    { label: 'XR Chest Lateral', loinc: '39051-8' },
    { label: 'XR Chest Oblique', loinc: '30740-5' },
  ];

  useEffect(() => {
    client.patient.read().then((patient) => setPatient(patient));

    if (reports.current === null) {
      getReports();
    }

    if (isViewingObservation.current === true) {
      if (!observationId) {
        console.log("No observation id provided.");
        observation.current = null;
      } else {
        getObservation();
        isViewingObservation.current = false;
      }
    }

    if (isViewingObservations.current === true) {
      getObservations();
      isViewingObservations.current = false;
    }

    if (isDeletingReport.current === true) {
      client.delete("DiagnosticReport/" + reportId);
      console.log("Deleted report with id: " + reportId);
      reports.current = null;
      isDeletingReport.current = false;
    }

    // TODO: Write algorithm to choose Create or Update
    // Create/Update/Delete a DiagnosticReport
    if (isCreatingReport.current === true) {
      const diagnosticReport = {
        "resourceType": "DiagnosticReport",
        // "id": "1943319",
        "status": "final",
        "category" : [
          {
            "coding" : [
              {
                "system" : "http://terminology.hl7.org/CodeSystem/observation-category",
                "code" : "imaging",
                "display" : "Imaging"
              }
            ]
          }
        ],
        "code": {
          "coding": [
            {
              "system": "http://loinc.org",
              "code": selectedViewCode.loinc,
              "display": selectedViewCode.label,
              "path": "code"
            }
          ],
          "text": selectedViewCode.label
        },
        "subject": {
          "reference": "Patient/" + client.patient.id,
        },
        "conclusionCode": {
          "coding": [
            {
              "system": "http://dicom.nema.org/resources/ontology/DCM",
              "code": "121073",
              "display": "Impression"
            }
          ],
          "text": "Impression"
        },
        "conclusion": aiReport.current.impression, // Put impression here
        "issued": "2023-10-06T10:00:00Z",
        "result": [
          {
            "reference": "Observation/" + createdObservationId,
            "display": selectedViewCode.label
          }
        ]
      };

      client.create(diagnosticReport)
      .then((response) => {
        console.log("Created report:");
        console.log(response);
        stepStatus.current.step4 = true;
        setReportId(response.id);
      });
      reports.current = null;
      isCreatingReport.current = false;
    }


    if (isCreatingObservation.current === true) {
      const observationReport = {
        "resourceType": "Observation",
        "status": "final",
        "category": [
          {
            "coding": [
              {
                "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                "code": "imaging",
                "display": "imaging"
              }
            ]
          }
        ],
        "code": {
          "coding": [
            {
              "system": "http://loinc.org",
              "code": selectedViewCode.loinc,
              "display": selectedViewCode.label,
              "path": "code"
            }
          ],
          "text": selectedViewCode.label
        },
        "subject": {
          "reference": "Patient/" + client.patient.id,
        },
        "component": [
          {
            "code" : {
              "coding" : [
                {
                  "system" : "http://dicom.nema.org/resources/ontology/DCM",
                  "code" : "121071",
                  "display" : "Finding"
                }
              ]
            },
            "valueString" : aiReport.current.findings // put findings here
          }
        ]
      };

      client.create(observationReport)
      .then((response) => {
        console.log("Created observation:");
        console.log(response);
        setCreatedObservationId(response.id);
        setObservationId(response.id);
        stepStatus.current.step3 = true;
      });
      isCreatingObservation.current = false;
    }
  });


  let pat = patient ?
    <PatientVisualizer patient={patient} />
    : <Spinner />;

  const handleFileUpload = (selectedFile) => {
    const formdata = new FormData();
    formdata.append('input_file', selectedFile, '1_IM-0001-4002.dcm');

    const requestOptions = {
      method: 'POST',
      body: formdata,
      redirect: 'follow',
    };

    fetch('http://127.0.0.1/dicom_to_report', requestOptions)
      .then((response) => {
        console.log(response)
        return response.json();
      })
      .then((data) => {
        aiReport.current = JSON.parse(data.data);
        console.log(data);
      })
      .catch((error) => console.log('error', error));
  }

  const createReport = () => {
    stepStatus.current.step4 = false;
    isCreatingReport.current = true;
  }

  const deleteReport = () => {
    isDeletingReport.current = true;
  }

  const createObservation = () => {
    stepStatus.current.step3 = false;
    isCreatingObservation.current = true;
  }

  const { register, handleSubmit, formState: { errors } } = useForm();
  const onSubmit = data => {
    let np = patient;
    np.name[0].given[0] = data.fname;
    np.name[0].family = data.lname;
    setPatient(np);
    client.update(np);
  };

  return (
    <div id="app">
      <Container>
        {pat}
      </Container>
      {/* Patient viewer ------------------------------ */}
      {patient ?
        <Container>
          <h4>Update Patient Name</h4>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group className="mb-3" controlId="formFirst">
              <Form.Label>First</Form.Label>
              <Form.Control type="text" {...register("fname")} defaultValue={patient.name[0].given.join(' ')} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formLast">
              <Form.Label>Last</Form.Label>
              <Form.Control type="text" {...register("lname")} defaultValue={patient.name[0].family} />
            </Form.Group>
            <Button type="submit">Update</Button>
          </Form>
        </Container>
        : ""}
      {/* AI report ------------------------------ */}
      <Container>
        <br />
        <h4 style={
          {
            color: stepStatus.current.step1 ? 'green' : 'red',
          }
        }>Step 1. Fetch API Report</h4>
        <input
          type="file"
          id="fileInput"
          onChange={(e) => handleFileUpload(e.target.files[0])}
          accept=".dcm"
        />
        <br/>
        <br/>
        <pre id="apiResponse">API response will be logged here</pre>

        {aiReport.current != null ? (
          stepStatus.current.step1 = true,
          <pre className='text-wrap' style={
            {
              width: '70%',

            }
          }>
            Findings: 
            <br />
            {aiReport.current.findings}
            <br />
            <br />
            Impression: 
            <br />
            {aiReport.current.impression}
            <br />
          </pre>
        ) : (
          <p>No existing reports available.</p>
        )}
      </Container>
      {/* Select X-Ray view ------------------------------ */}
      <Container>
        <h4 style={
          {
            color: stepStatus.current.step2 ? 'green' : 'red',
          }
        }>Step 2. Select X-Ray view</h4>
        <Dropdown onSelect={handleSelect}>
          <Dropdown.Toggle variant="secondary" id="dropdown-basic">
            Selected View: {selectedViewCode.label}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {dropdownViews.map((item, index) => (
              <Dropdown.Item key={index} eventKey={[item.label, item.loinc]}>
                {item.label}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      </Container>
      {/* Create Observation ------------------------------ */}
      <Container>
        <br/>
        <h4 style={
          {
            color: stepStatus.current.step3 ? 'green' : 'red',
          }
        }>Step 3. Create Observation</h4>
        <Button type="button" className="btn btn-primary" onClick={createObservation}>Create Observation</Button>
        <text style={
          {
            color: 'green',
            fontWeight: 'bold',
            paddingLeft: '1%',
          }
        }>{stepStatus.current.step3 ? "Done!" : ""}</text>
        <br/>
        <input
          type="text"
          value={observationId}
          onChange={(e) => setObservationId(e.target.value)}
        />
        <br/>
        <Button type="button" className="btn btn-primary" onClick={() => isViewingObservation.current = true}>View Observation</Button>
        <Button type="button" className="btn btn-primary" onClick={() => isViewingObservations.current = true}>View all Observations</Button>
      </Container>

      <Container>
        {observation.current != null ? (
          <ObservationViewer data={observation.current} />
        ) : (
        <text/>
        )}
      </Container>
      {/* Create Diagnostic report ------------------------------ */}
      <Container>
        <br />
        <h4 style={
          {
            color: stepStatus.current.step4 ? 'green' : 'red',
          }
        }> Step 4. Create Diagnostic Report</h4>
        <Button type="button" className="btn btn-primary" onClick={createReport}>Create Report</Button>
        <text style={
          {
            color: 'green',
            fontWeight: 'bold',
            paddingLeft: '1%',
          }
        }>{stepStatus.current.step4 ? "Done!" : ""}</text>
      </Container>
      <Container>
        <input
          type="number"
          value={reportId}
          onChange={(e) => setReportId(e.target.value)}
        />
        <br/>
        <Button type="button" className="btn btn-primary" onClick={deleteReport}>Delete Report</Button>
      </Container>
      <Container>
        <br/>
        <h4>Existing Diagnostic Report</h4>
        <h5>Select a Report ID</h5>
        <Dropdown onSelect={(id) => setSelectedReportId(id)}>
          <Dropdown.Toggle variant="secondary">
            Report ID: {selectedReportId || "Select a report ID"}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {reportIds.map(id => (
              <Dropdown.Item key={id} eventKey={id}>
                {id}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
        {reports.current !== null && selectedReportId ? (
          reports.current.filter(report => report.id === selectedReportId).map((report, index) => (
            <div key={index} className="existing-report">
              <h5>Report {index + 1}</h5>
              <ReportViewer data={report} />
            </div>
          ))
        ) : (
          <p>Select a report ID to view the report.</p>
        )}
      </Container>
    </div>
  );
}

function ReportViewer({ data }) {
  const convertCamelCase = (str) => {
    return str
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase());
  };

  const renderData = (key, value) => {
    if (Array.isArray(value)) {
      return (
        <ul className="pl-3">
          {value.map((item, index) => (
            <li key={index}>
              {typeof item === 'object' ? <ReportViewer data={item} /> : item}
            </li>
          ))}
        </ul>
      );
    } else if (typeof value === 'object') {
      return <ReportViewer data={value} />;
    } else if (key === 'reference') {
      return <a href="#">{value}</a>; // dummy link
    } else {
      return value;
    }
  };

  return (
    <div>
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="mb-2">
          <strong>{convertCamelCase(key)}</strong>
          <div className="ml-3">{renderData(key, value)}</div>
        </div>
      ))}
    </div>
  );
};

function ObservationViewer({ data }) {
  const convertCamelCase = (str) => {
    return str
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase());
  };

  const renderData = (key, value) => {
    if (Array.isArray(value)) {
      return (
        <ul className="pl-3">
          {value.map((item, index) => (
            <li key={index}>
              {typeof item === 'object' ? <ObservationViewer data={item} /> : item}
            </li>
          ))}
        </ul>
      );
    } else if (typeof value === 'object') {
      return <ObservationViewer data={value} />;
    } else if (key === 'reference') {
      return <a href="#">{value}</a>; // dummy link
    } else {
      return value;
    }
  };

  return (
    <div>
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="mb-2">
          <strong>{convertCamelCase(key)}</strong>
          <div className="ml-3">{renderData(key, value)}</div>
        </div>
      ))}
    </div>
  );
}