import React from "react";

// reactstrap components
import { Button, Container, Row, Col, Modal, ModalBody } from "reactstrap";

import { useParams } from "react-router-dom";

// core components
import ExamplesNavbar from "components/Navbars/ExamplesNavbar.js";
import ProfilePageHeader from "components/Headers/ProfilePageHeader.js";
import DefaultFooter from "components/Footers/DefaultFooter.js";

import { getUserAssets, getDigitalIdentity, getAssetInfo } from "dapp/interact";
import { retrieveFile, createSignedURL } from "dapp/ipfs";

const PLACEHOLDER = [
  {
    src: require("assets/img/bg1.jpg"),
    pageLink: require("assets/img/bg1.jpg"),
  },
  {
    src: require("assets/img/bg3.jpg"),
    pageLink: require("assets/img/bg3.jpg"),
  },
  {
    src: require("assets/img/bg4.jpg"),
    pageLink: require("assets/img/bg4.jpg"),
  },
  {
    src: require("assets/img/bg5.jpg"),
    pageLink: require("assets/img/bg5.jpg"),
  },
  {
    src: require("assets/img/bg6.jpg"),
    pageLink: require("assets/img/bg6.jpg"),
  },
  {
    src: require("assets/img/bg7.jpg"),
    pageLink: require("assets/img/bg7.jpg"),
  },
];

function ProfilePage() {
  const { address } = useParams();

  const [assets, setAssets] = React.useState([]);
  const [username, setUsername] = React.useState("");
  const [isBrand, setIsBrand] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(async () => {
    setLoading(true);
    // Fetch user's digital identity
    await fetchDigitalIdentity();

    // Retrieve user's assets
    await fetchUserAssets();
    setLoading(false);

    document.body.classList.add("profile-page");
    document.body.classList.add("sidebar-collapse");
    document.documentElement.classList.remove("nav-open");
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    return function cleanup() {
      document.body.classList.remove("profile-page");
      document.body.classList.remove("sidebar-collapse");
    };
  }, []);

  async function fetchDigitalIdentity() {
    const digitalIdentity = await getDigitalIdentity(address);
    setUsername(digitalIdentity.name);
    setIsBrand(digitalIdentity.isBrand);
    console.log(digitalIdentity);
  }

  async function fetchUserAssets() {
    const userAssetsList = await getUserAssets(address);
    console.log(userAssetsList);

    const assetsList = [];

    for (let assetId of userAssetsList) {
      const assetInfo = await getAssetInfo(assetId);
      console.log(assetInfo);
      const _assetData = await retrieveFile(assetInfo.metadata);
      console.log(_assetData.data);
      const imageSrc = await createSignedURL(_assetData.data.images[0]);
      assetsList.push({
        src: imageSrc,
        pageLink: "/asset/" + assetId,
      });
    }

    setAssets(assetsList);
  }

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
        <ProfilePageHeader username={username} address={address} isBrand={isBrand} />
        <div className="section">
          <Container>
            <div className="button-container">
              {isBrand ? (
                <Button
                  className="btn-round"
                  color="info"
                  size="lg"
                  href="/upload"
                >
                  Create Asset
                </Button>
              ) : (
                <></>
              )}
            </div>
            <Row>
              <Col className="ml-auto mr-auto" md="6">
                <h3 className="title text-center">Assets Owned</h3>
              </Col>
              <div className="gallery">
                <Container>
                  <Col className="ml-auto mr-auto" md="10">
                    <Row className="collections">
                      {assets.map((img, idx) => (
                        <Col md="4" key={idx}>
                          <a href={img.pageLink}>
                            <img
                              alt="..."
                              className="img-raised"
                              src={img.src}
                              style={{ aspectRatio: "1/1" }}
                            ></img>
                          </a>
                        </Col>
                      ))}
                    </Row>
                  </Col>
                </Container>
              </div>
            </Row>
          </Container>
        </div>
        <DefaultFooter />
      </div>
    </>
  );
}

export default ProfilePage;
