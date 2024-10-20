import React from "react";

// reactstrap components
import {
  Button,
  Container,
  Row,
  Col,
  Card,
  CardHeader,
  CardBody,
} from "reactstrap";

import { useParams } from "react-router-dom";

// core components
import ExamplesNavbar from "components/Navbars/ExamplesNavbar.js";
import ProfilePageHeader from "components/Headers/ProfilePageHeader.js";
import DefaultFooter from "components/Footers/DefaultFooter.js";

import {
  getUserAssets,
  retrieveFile,
  createSignedURL,
  verifyBrand,
} from "dapp/interact";

const PLACEHOLDER = [
  {
    src: require("assets/img/bg1.jpg"),
  },
  {
    src: require("assets/img/bg3.jpg"),
  },
  {
    src: require("assets/img/bg4.jpg"),
  },
  {
    src: require("assets/img/bg5.jpg"),
  },
  {
    src: require("assets/img/bg6.jpg"),
  },
  {
    src: require("assets/img/bg7.jpg"),
  },
];

function ProfilePage() {
  const { address } = useParams();

  const [assets, setAssets] = React.useState([]);
  const [isBrand, setIsBrand] = React.useState(false);

  React.useEffect(() => {
    // Retrieve user's assets
    fetchUserAssets();

    // Check if user is brand
    const _isBrand = verifyBrand(address);
    setIsBrand(_isBrand);

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

  async function fetchUserAssets() {
    const userAssetsList = await getUserAssets(address);
    console.log(userAssetsList);
  }

  return (
    <>
      <ExamplesNavbar />
      <div className="wrapper">
        <ProfilePageHeader address={address} />
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
                      {PLACEHOLDER.map((img, idx) => (
                        <Col md="4" key={idx}>
                          <img
                            alt="..."
                            className="img-raised"
                            src={img.src}
                            style={{ aspectRatio: "1/1" }}
                          ></img>
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
