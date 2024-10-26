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
  CardTitle,
  CardHeader,
  CardFooter,
  Pagination,
  PaginationItem,
  PaginationLink,
  Form,
  Input,
  InputGroup,
  InputGroupText,
  InputGroupAddon,
  Alert,
} from "reactstrap";

// Connect to smart contract
import {
  digitalOwnershipContract,
  showOwnershipHistory,
  getDigitalIdentity,
  getCurrentWalletConnected,
  getPendingTransactions,
  initiateAssetTransfer,
  cancelAssetTransfer,
  confirmAssetTransfer,
  getAssetInfo,
} from "dapp/interact";
import { retrieveFile, createSignedURL } from "dapp/ipfs";

import { useParams } from "react-router-dom";

// core components
import ExamplesNavbar from "components/Navbars/ExamplesNavbar.js";
import LandingPageHeader from "components/Headers/LandingPageHeader.js";
import DefaultFooter from "components/Footers/DefaultFooter.js";
import CarouselSection from "views/index-sections/Carousel";

function LandingPage() {
  const { assetId } = useParams();

  const [currentUser, setCurrentUser] = React.useState("");
  const [pendingTransaction, setPendingTransaction] = React.useState(null);
  const [recipientAddress, setRecipientAddress] = React.useState("");

  const [firstFocus, setFirstFocus] = React.useState(false);
  const [lastFocus, setLastFocus] = React.useState(false);
  const [assetData, setAssetData] = React.useState({});
  const [images, setImages] = React.useState([]);
  const [ownershipHistory, setOwnershipHistory] = React.useState([]);
  const [activePage, setActivePage] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  const [transferStatus, setTransferStatus] = React.useState({
    color: "info",
    message: "",
    open: false,
  });

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

    const { address, status } = await getCurrentWalletConnected();
    setCurrentUser(address);

    const assetInfo = await getAssetInfo(assetId);

    const _assetData = await retrieveFile(assetInfo.metadata);
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

    console.log(_ownershipHistory);

    const ownershipHistoryList = [];

    for (const val of _ownershipHistory) {
      const _digitalIdentity = await getDigitalIdentity(val.to);
      ownershipHistoryList.push({
        assetId: val.assetId,
        owner: {
          username: _digitalIdentity.name,
          address: val.to,
        },
        timestamp: val.timestamp,
      });
    }

    setOwnershipHistory(ownershipHistoryList);

    const _pendingTransaction = await getPendingTransactions(assetId);

    if (Number(_pendingTransaction.to) !== 0) {
      setPendingTransaction({
        assetId: _pendingTransaction.assetId,
        from: _pendingTransaction.from,
        to: _pendingTransaction.to,
      });
    }

    setLoading(false);
  }

  function listenToAssetTransfer() {
    digitalOwnershipContract.events.AssetTransferred({}, (error, data) => {
      if (data) {
        console.log(data);
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

  const initiateTransfer = async (e) => {
    e.preventDefault();
    if (recipientAddress !== "") {
      const { status } = await initiateAssetTransfer(assetId, recipientAddress);
      setTransferStatus({ ...status, open: true });
    } else {
      setTransferStatus({
        color: "danger",
        message: "Please input an address",
        open: true,
      });
    }
  };

  const cancelTransfer = async (e) => {
    e.preventDefault();
    const { status } = await cancelAssetTransfer(assetId);
    setTransferStatus({ ...status, open: true });

    // Update pending transaction
    setPendingTransaction(null);
  };

  const confirmTransfer = async (e) => {
    e.preventDefault();
    const { status } = await confirmAssetTransfer(assetId);
    setTransferStatus({ ...status, open: true });

    setPendingTransaction(null);
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
                        <h3 className="title">
                          {" "}
                          {ownershipHistory[activePage].owner.username}
                        </h3>
                        <p className="category text-info">
                          {ownershipHistory[activePage].owner.address}
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
        <div
          className="section section-signup"
          style={{
            backgroundImage: "url(" + require("assets/img/bg11.jpg") + ")",
            backgroundSize: "cover",
            backgroundPosition: "top center",
            minHeight: "700px",
          }}
        >
          <Container>
            <Alert color={transferStatus.color} isOpen={transferStatus.open}>
              <Container>
                <div className="alert-icon">
                  <i className="now-ui-icons travel_info"></i>
                </div>
                {transferStatus.message}
                <button
                  type="button"
                  className="close"
                  onClick={(e) => {
                    e.preventDefault();
                    setTransferStatus({ ...transferStatus, open: false });
                  }}
                >
                  <span aria-hidden="true">
                    <i className="now-ui-icons ui-1_simple-remove"></i>
                  </span>
                </button>
              </Container>
            </Alert>
            {ownershipHistory.length > 0 &&
            currentUser.toLowerCase() ===
              ownershipHistory[
                ownershipHistory.length - 1
              ].owner.address.toLowerCase() ? (
              <Row>
                <Card className="card-signup" data-background-color="blue">
                  <Form action="" className="form" method="">
                    <CardHeader className="text-center">
                      <CardTitle className="title-up" tag="h3">
                        Transfer Ownership
                      </CardTitle>
                    </CardHeader>
                    <CardBody>
                      {pendingTransaction ? (
                        <p className="description">
                          Transfer to {pendingTransaction.to} currently pending.
                        </p>
                      ) : (
                        <InputGroup
                          className={
                            "no-border" +
                            (firstFocus ? " input-group-focus" : "")
                          }
                        >
                          <InputGroupAddon addonType="prepend">
                            <InputGroupText>
                              <i className="now-ui-icons users_circle-08"></i>
                            </InputGroupText>
                          </InputGroupAddon>
                          <Input
                            placeholder="Recipient address..."
                            type="text"
                            value={recipientAddress}
                            onFocus={() => setFirstFocus(true)}
                            onBlur={() => setFirstFocus(false)}
                            onChange={(e) => {
                              e.preventDefault();
                              setRecipientAddress(e.target.value);
                            }}
                          ></Input>
                        </InputGroup>
                      )}
                    </CardBody>
                    <CardFooter className="text-center">
                      {pendingTransaction ? (
                        <Button
                          className="btn-danger btn-round"
                          color="info"
                          onClick={cancelTransfer}
                          size="lg"
                        >
                          Cancel
                        </Button>
                      ) : (
                        <Button
                          className="btn-neutral btn-round"
                          color="info"
                          onClick={initiateTransfer}
                          size="lg"
                        >
                          Send
                        </Button>
                      )}
                    </CardFooter>
                  </Form>
                </Card>
              </Row>
            ) : (
              <></>
            )}
            {pendingTransaction &&
            currentUser.toLowerCase() ===
              pendingTransaction.to.toLowerCase() ? (
              <Row className="mt-4">
                <Card className="card-signup">
                  <Form action="" className="form" method="">
                    <CardHeader className="text-center">
                      <CardTitle className="title-up" tag="h3">
                        Pending Transaction
                      </CardTitle>
                    </CardHeader>
                    <CardBody>
                      <h5 className="description">
                        <b>
                          {
                            ownershipHistory[ownershipHistory.length - 1].owner
                              .username
                          }
                        </b>
                        &nbsp; ({pendingTransaction.from}) is transferring
                        ownership of this asset to you.
                      </h5>
                    </CardBody>
                    <CardFooter className="text-center">
                      <Button
                        className="btn-success btn-round"
                        color="info"
                        onClick={confirmTransfer}
                        size="lg"
                      >
                        Approve
                      </Button>
                      <Button
                        className="btn-danger btn-round"
                        color="info"
                        onClick={cancelTransfer}
                        size="lg"
                      >
                        Decline
                      </Button>
                    </CardFooter>
                  </Form>
                </Card>
              </Row>
            ) : (
              <></>
            )}
          </Container>
        </div>
        <DefaultFooter />
      </div>
    </>
  );
}

export default LandingPage;
