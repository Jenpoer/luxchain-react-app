import React from "react";

// reactstrap components
import {
  Button,
  Modal,
  ModalBody,
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Pagination,
  PaginationItem,
  PaginationLink,
} from "reactstrap";

// Connect to smart contract
import { digitalOwnershipContract, showOwnershipHistory } from "dapp/interact";
import { retrieveFile, createSignedURL } from "dapp/ipfs";

import { useParams } from "react-router-dom";

// core components
import ExamplesNavbar from "components/Navbars/ExamplesNavbar.js";
import LandingPageHeader from "components/Headers/LandingPageHeader.js";
import DefaultFooter from "components/Footers/DefaultFooter.js";
import CarouselSection from "views/index-sections/Carousel";

function LandingPage() {
  const { assetId } = useParams();

  const [firstFocus, setFirstFocus] = React.useState(false);
  const [lastFocus, setLastFocus] = React.useState(false);
  const [assetData, setAssetData] = React.useState({});
  const [images, setImages] = React.useState([]);
  const [ownershipHistory, setOwnershipHistory] = React.useState([]);
  const [activePage, setActivePage] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchAssetInformation();
    listenToAssetTransfer();

    document.body.classList.add("landing-page");
    document.body.classList.add("sidebar-collapse");
    document.documentElement.classList.remove("nav-open");
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    return function cleanup() {
      document.body.classList.remove("landing-page");
      document.body.classList.remove("sidebar-collapse");
    };
  }, []);

  async function fetchAssetInformation() {
    setLoading(true);

    const _assetData = await retrieveFile(
      "bafkreihkyg75gbude6lzxi4l52pug27yhffpxhpco4tsbkt3im3n6ajooa"
    );
    setAssetData(_assetData.data);
    console.log(_assetData);

    const imageURLs = [];
    for (const imageCID of _assetData.data.images) {
      console.log(imageCID);
      const signedURL = await createSignedURL(imageCID);
      imageURLs.push(signedURL);
    }

    const _images = imageURLs.map((url, idx) => {
      return {
        src: url,
        altText: "Image " + idx,
        caption: "Image " + idx,
      };
    });
    setImages(_images);

    const _ownershipHistory = await showOwnershipHistory(assetId);
    setOwnershipHistory(
      _ownershipHistory.map((val) => {
        return {
          assetId: val.assetId,
          to: val.to,
          from: val.from,
          timestamp: val.timestamp,
        };
      })
    );
    setLoading(false);
  }

  function listenToAssetTransfer() {
    digitalOwnershipContract.events.AssetTransferred({}, (error, data) => {
      if (data) {
      }
    });
  }

  const generateTextBreaks = (text) => {
    const textWithBreaks = text.split("\n").map((_text, _index) => (
      <React.Fragment key={_index}>
        {_text}
        <br />
      </React.Fragment>
    ));

    return <div>{textWithBreaks}</div>;
  };

  const handlePageChange = (e, pageNumber) => {
    e.preventDefault();
    setActivePage(pageNumber);
  };

  const movePageForward = (e) => {
    e.preventDefault();
    setActivePage(Math.min(activePage + 1, ownershipHistory.length - 1));
  };

  const movePageBackward = (e) => {
    e.preventDefault();
    setActivePage(Math.max(activePage - 1, 0));
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
          <p>Loading information...</p>
        </ModalBody>
      </Modal>
      <div className="wrapper">
        <LandingPageHeader assetName={assetData.name} assetId={assetId} />
        <div className="section section-about-us">
          <Container>
            <Row>
              <Col className="ml-auto mr-auto text-center" md="8">
                <h5 className="description">
                  {assetData.description ? (
                    generateTextBreaks(assetData.description)
                  ) : (
                    <></>
                  )}
                </h5>
              </Col>
            </Row>
            <div className="separator separator-primary"></div>
          </Container>
        </div>
        <CarouselSection items={images} />
        <div className="section section-team text-center">
          <Container>
            <h2 className="title">Ownership History</h2>
            <Row>
              {ownershipHistory.length > 0 ? (
                <Col className="ml-auto mr-auto" md="4" xl="4">
                  <Card>
                    <CardBody>
                      <div className="team-player m-2">
                        <Col className="ml-auto mr-auto" sm="6">
                          <img
                            alt="..."
                            className="rounded-circle img-fluid img-raised"
                            src={require("assets/img/eva.jpg")}
                          ></img>
                        </Col>
                        <h3 className="title">Display Name</h3>
                        <p className="category text-info">
                          {ownershipHistory[activePage].to}
                        </p>
                        <p className="description">
                          {new Date(
                            ownershipHistory[activePage].timestamp * 1000
                          ).toLocaleString("en-gb")}
                        </p>
                      </div>
                    </CardBody>
                  </Card>
                </Col>
              ) : (
                <></>
              )}
            </Row>
            <Row className="content-center justify-content-center">
              <Pagination>
                <PaginationItem>
                  <PaginationLink
                    aria-label="Previous"
                    onClick={(e) => movePageBackward(e)}
                  >
                    <span aria-hidden={true}>
                      <i
                        aria-hidden={true}
                        className="fa fa-angle-double-left"
                      ></i>
                    </span>
                  </PaginationLink>
                </PaginationItem>
                {ownershipHistory.map((val, idx) => (
                  <PaginationItem key={idx} active={idx === activePage}>
                    <PaginationLink onClick={(e) => handlePageChange(e, idx)}>
                      {idx + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationLink
                    aria-label="Next"
                    onClick={(e) => movePageForward(e)}
                  >
                    <span aria-hidden={true}>
                      <i
                        aria-hidden={true}
                        className="fa fa-angle-double-right"
                      ></i>
                    </span>
                  </PaginationLink>
                </PaginationItem>
              </Pagination>
            </Row>
          </Container>
        </div>
        {/* <div className="section section-contact-us text-center">
          <Container>
            <h2 className="title">Want to work with us?</h2>
            <p className="description">Your project is very important to us.</p>
            <Row>
              <Col className="text-center ml-auto mr-auto" lg="6" md="8">
                <InputGroup
                  className={
                    "input-lg" + (firstFocus ? " input-group-focus" : "")
                  }
                >
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText>
                      <i className="now-ui-icons users_circle-08"></i>
                    </InputGroupText>
                  </InputGroupAddon>
                  <Input
                    placeholder="First Name..."
                    type="text"
                    onFocus={() => setFirstFocus(true)}
                    onBlur={() => setFirstFocus(false)}
                  ></Input>
                </InputGroup>
                <InputGroup
                  className={
                    "input-lg" + (lastFocus ? " input-group-focus" : "")
                  }
                >
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText>
                      <i className="now-ui-icons ui-1_email-85"></i>
                    </InputGroupText>
                  </InputGroupAddon>
                  <Input
                    placeholder="Email..."
                    type="text"
                    onFocus={() => setLastFocus(true)}
                    onBlur={() => setLastFocus(false)}
                  ></Input>
                </InputGroup>
                <div className="textarea-container">
                  <Input
                    cols="80"
                    name="name"
                    placeholder="Type a message..."
                    rows="4"
                    type="textarea"
                  ></Input>
                </div>
                <div className="send-button">
                  <Button
                    block
                    className="btn-round"
                    color="info"
                    href="#pablo"
                    onClick={(e) => e.preventDefault()}
                    size="lg"
                  >
                    Send Message
                  </Button>
                </div>
              </Col>
            </Row>
          </Container>
        </div> */}
        <DefaultFooter />
      </div>
    </>
  );
}

export default LandingPage;
