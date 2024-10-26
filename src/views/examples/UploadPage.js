import React from "react";
import { v4 as uuidv4 } from "uuid";

// reactstrap components
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Form,
  Input,
  InputGroupAddon,
  InputGroupText,
  InputGroup,
  Container,
  Col,
  Row,
  Alert,
  Modal,
  ModalBody,
} from "reactstrap";

import {
  registerAsset,
  connectWallet,
  verifyBrand,
  getCurrentWalletConnected,
} from "dapp/interact";
import { uploadFiles, uploadJson } from "dapp/ipfs";

// core components
import ExamplesNavbar from "components/Navbars/ExamplesNavbar.js";
import TransparentFooter from "components/Footers/TransparentFooter.js";

function UploadPage() {
  const [firstFocus, setFirstFocus] = React.useState(false);
  const [lastFocus, setLastFocus] = React.useState(false);

  const [loading, setLoading] = React.useState(false);

  const [formData, setFormData] = React.useState({
    name: "",
    description: "",
    images: [],
  });
  const fileInputRef = React.useRef(null);

  const [status, setStatus] = React.useState({
    color: "info",
    message: "",
    open: false,
  });

  React.useEffect(() => {
    document.body.classList.add("login-page");
    document.body.classList.add("sidebar-collapse");
    document.documentElement.classList.remove("nav-open");
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    return function cleanup() {
      document.body.classList.remove("login-page");
      document.body.classList.remove("sidebar-collapse");
    };
  }, []);

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    if (name === "images") {
      const files = Array.from(event.target.files);
      setFormData({
        ...formData,
        images: files,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const uploadFilesToIPFS = async (assetId) => {
    try {
      // Upload images
      const imageCID = await uploadFiles(formData["images"]);

      // Construct metadata
      const metadata = {
        ...formData,
        images: imageCID,
      };

      // Upload JSON metadata
      const cid = await uploadJson(metadata, assetId);

      console.log("Uploaded to IPFS with CID:", cid);
      return cid;
    } catch (error) {
      console.error("Error uploading images:", error);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent the default form submission

    setLoading(true);

    // Check for connected wallet
    const { address, status: _status } = await getCurrentWalletConnected();

    // Check if wallet is a brand account
    const isBrand = await verifyBrand(address);

    if (!isBrand) {
      setStatus({
        color: "danger",
        message: "You are not a registered brand address!",
        open: true,
      });
      throw new Error("You are not a registered brand address!");
    }

    if (_status.color === "danger") {
      setStatus({ ..._status, open: true });
      throw new Error(_status.message);
    }

    // Handle form submission logic (e.g., send data to an API)
    console.log("Form submitted:", formData);

    // Generate asset ID
    const assetId = uuidv4();

    // Upload files to IPFS
    const cid = await uploadFilesToIPFS(assetId);

    // Register asset using smart contract
    const response = await registerAsset(assetId, formData.name, cid);

    setStatus({
      ...response.status,
      open: true,
    });

    // Reset the form
    setFormData({
      name: "",
      description: "",
      images: [],
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setLoading(false);
  };

  return (
    <>
      <ExamplesNavbar />
      <Modal modalClassName="modal-mini modal-info" isOpen={loading}>
        <div className="modal-header justify-content-center">
          <div className="modal-profile">
            <i className="now-ui-icons loader_refresh spin"></i>
          </div>
        </div>
        <ModalBody>
          <p>Creating asset...</p>
        </ModalBody>
      </Modal>
      <div className="page-header clear-filter" filter-color="blue">
        <div
          className="page-header-image"
          style={{
            backgroundImage: "url(" + require("assets/img/login.jpg") + ")",
          }}
        ></div>
        <div className="content">
          <Container>
            <Col className="ml-auto mr-auto" md="10">
              <Alert color={status.color} isOpen={status.open}>
                <Container>
                  <div className="alert-icon">
                    <i className="now-ui-icons travel_info"></i>
                  </div>
                  {status.message}
                  <button
                    type="button"
                    className="close"
                    onClick={(e) => {
                      e.preventDefault();
                      setStatus({ ...status, open: false });
                    }}
                  >
                    <span aria-hidden="true">
                      <i className="now-ui-icons ui-1_simple-remove"></i>
                    </span>
                  </button>
                </Container>
              </Alert>
              <Card className="p-4">
                <Form className="form" onSubmit={handleSubmit}>
                  <CardHeader className="text-center">
                    {/* <div className="pull-right">
                      <Button
                        className="btn-round"
                        color="info"
                        size="sm"
                        onClick={async (e) => {
                          e.preventDefault();
                          const { address, status: _status } =
                            await connectWallet();
                          setStatus({ ..._status, open: true });
                        }}
                      >
                        Connect Wallet
                      </Button>
                    </div>
                    <br /> */}
                    <h2 className="title text-dark">Create Asset</h2>
                    <p className="description text-secondary">
                      Your project is very important to us.
                    </p>
                  </CardHeader>
                  <CardBody>
                    <InputGroup
                      className={
                        "no-border input-lg" +
                        (firstFocus ? " input-group-focus" : "")
                      }
                    >
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          <i className="now-ui-icons users_circle-08"></i>
                        </InputGroupText>
                      </InputGroupAddon>
                      <Input
                        name="name"
                        placeholder="Asset Name..."
                        type="text"
                        value={formData.name}
                        onChange={handleFormChange}
                        onFocus={() => setFirstFocus(true)}
                        onBlur={() => setFirstFocus(false)}
                      ></Input>
                    </InputGroup>
                    <InputGroup
                      className={
                        "no-border input-lg" +
                        (lastFocus ? " input-group-focus" : "")
                      }
                    >
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          <i className="now-ui-icons text_caps-small"></i>
                        </InputGroupText>
                      </InputGroupAddon>
                      <Input
                        cols="80"
                        name="description"
                        placeholder="Description..."
                        rows="4"
                        type="textarea"
                        value={formData.description}
                        onChange={handleFormChange}
                        onFocus={() => setLastFocus(true)}
                        onBlur={() => setLastFocus(false)}
                      ></Input>
                    </InputGroup>
                    <InputGroup className="no-border input-lg text-secondary">
                      <p className="text-secondary">Upload Images</p>
                      <Input
                        name="images"
                        multiple
                        accept="image/*"
                        onChange={handleFormChange}
                        type="file"
                        ref={fileInputRef}
                      ></Input>
                    </InputGroup>
                  </CardBody>
                  <CardFooter className="text-center">
                    <Button
                      block
                      type="submit"
                      className="btn-round"
                      color="info"
                      size="lg"
                    >
                      Create
                    </Button>
                  </CardFooter>
                </Form>
              </Card>
            </Col>
          </Container>
        </div>
        <TransparentFooter />
      </div>
    </>
  );
}

export default UploadPage;
