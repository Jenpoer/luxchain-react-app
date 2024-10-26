const alchemyKey = process.env.REACT_APP_ALCHEMY_KEY;
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3(alchemyKey);
const contractABI = require("./digitalownership-abi.json");
const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;

const adminAddress = process.env.REACT_APP_ADMIN_ADDRESS;

export const digitalOwnershipContract = new web3.eth.Contract(
  contractABI,
  contractAddress
);

// -----------------
// Fetching data
// -----------------
export const getUserAssets = async (address) => {
  const userAssets = await digitalOwnershipContract.methods
    .getUserAssets(address)
    .call();

  return userAssets;
};

export const getDigitalIdentity = async (address) => {
  const digitalIdentity = await digitalOwnershipContract.methods
    .getDigitalIdentity(address)
    .call();

  return digitalIdentity;
};

export const showOwnershipHistory = async (assetId) => {
  const ownershipHistory = await digitalOwnershipContract.methods
    .showOwnershipHistory(assetId)
    .call();

  return ownershipHistory;
};

export const verifyBrand = async (address) => {
  const isBrand = await digitalOwnershipContract.methods
    .verifyBrandAddress(address)
    .call();

  return isBrand;
};

export const verifyOwner = async (assetId) => {
  const owner = await digitalOwnershipContract.methods
    .verifyOwner(assetId)
    .call();

  return owner;
};

export const getPendingTransactions = async (assetId) => {
  const transactions = await digitalOwnershipContract.methods
    .getPendingTransactions(assetId)
    .call();

  return transactions;
};

export const getAssetInfo = async (assetId) => {
  const info = await digitalOwnershipContract.methods.getAsset(assetId).call();
  return info;
};

// -----------------
// Registration
// -----------------

// export const registerBrand = async (brandAddress) => {
//   const res = await digitalOwnershipContract.methods
//     .registerBrand(brandAddress)
//     .call({ from: adminAddress });

//   return res;
// };

export const registerDigitalIdentity = async (username) => {
  const { address, status } = await getCurrentWalletConnected();

  //set up transaction parameters
  const transactionParameters = {
    to: contractAddress, // Required except during contract publications.
    from: address, // must match user's active address.
    data: digitalOwnershipContract.methods
      .addUser(username, address)
      .encodeABI(),
  };

  //sign the transaction
  try {
    const txHash = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [transactionParameters],
    });
    return {
      status: {
        color: "success",
        message: "Successfully registered user!",
      },
    };
  } catch (err) {
    return {
      status: {
        color: "danger",
        message: "An error has occurred: " + err.message,
      },
    };
  }
};

export const registerAsset = async (assetId, name, ipfsHash) => {
  const { address: brandAddress, status } = await getCurrentWalletConnected();

  //set up transaction parameters
  const transactionParameters = {
    to: contractAddress, // Required except during contract publications.
    from: brandAddress, // must match user's active address.
    data: digitalOwnershipContract.methods
      .registerAssetWithIPFS(assetId, name, ipfsHash)
      .encodeABI(),
  };

  //sign the transaction
  try {
    const txHash = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [transactionParameters],
    });
    return {
      status: {
        color: "success",
        message: (
          <span>
            <p>Successfully registered asset with id: {assetId}</p>
            <br />
            <a
              color="default"
              target="_blank"
              href={`https://sepolia.etherscan.io/tx/${txHash}`}
            >
              View the status of your transaction on Etherscan!
            </a>
          </span>
        ),
      },
    };
  } catch (err) {
    return {
      status: {
        color: "danger",
        message: "An error has occurred: " + err.message,
      },
    };
  }
};

// -----------------
// Connecting wallet
// -----------------

export const connectWallet = async () => {
  if (window.ethereum) {
    try {
      // Connect to Metamask
      const addressArray = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      return {
        status: {
          color: "success",
          message: "Account connected!",
        },
        address: addressArray[0],
      };
    } catch (err) {
      return {
        address: "",
        status: {
          color: "danger",
          message: "An error has occurred: " + err.message,
        },
      };
    }
  } else {
    return {
      address: "",
      status: {
        color: "danger",
        message:
          "You must install Metamask, a virtual Ethereum wallet, in your browser.",
      },
    };
  }
};

export const getCurrentWalletConnected = async () => {
  if (window.ethereum) {
    try {
      const addressArray = await window.ethereum.request({
        method: "eth_accounts",
      });
      if (addressArray.length > 0) {
        return {
          address: addressArray[0],
          status: {
            color: "success",
            message: "Account successfully connected!",
          },
        };
      } else {
        return {
          address: "",
          status: {
            color: "danger",
            message: "Connect to Metamask using the top right button.",
          },
        };
      }
    } catch (err) {
      return {
        address: "",
        status: {
          color: "danger",
          message: "An error has occurred: " + err.message,
        },
      };
    }
  } else {
    return {
      address: "",
      status: {
        color: "danger",
        message:
          "You must install Metamask, a virtual Ethereum wallet, in your browser.",
      },
    };
  }
};

// -----------------
// Transfer Asset
// -----------------
export const initiateAssetTransfer = async (assetId, newOwner) => {
  const { address: brandAddress, status } = await getCurrentWalletConnected();

  //set up transaction parameters
  const transactionParameters = {
    to: contractAddress, // Required except during contract publications.
    from: brandAddress, // must match user's active address.
    data: digitalOwnershipContract.methods
      .initiateTransferAsset(assetId, newOwner)
      .encodeABI(),
  };

  //sign the transaction
  try {
    const txHash = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [transactionParameters],
    });
    return {
      status: {
        color: "success",
        message: (
          <span>
            <p>Successfully sent transfer request to {newOwner}</p>
            <br />
            <a
              color="default"
              target="_blank"
              href={`https://sepolia.etherscan.io/tx/${txHash}`}
            >
              View the status of your transaction on Etherscan!
            </a>
          </span>
        ),
      },
    };
  } catch (err) {
    return {
      status: {
        color: "danger",
        message: "An error has occurred: " + err.message,
      },
    };
  }
};

export const cancelAssetTransfer = async (assetId) => {
  const { address: brandAddress, status } = await getCurrentWalletConnected();

  //set up transaction parameters
  const transactionParameters = {
    to: contractAddress, // Required except during contract publications.
    from: brandAddress, // must match user's active address.
    data: digitalOwnershipContract.methods
      .cancelTransaction(assetId)
      .encodeABI(),
  };

  //sign the transaction
  try {
    const txHash = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [transactionParameters],
    });
    return {
      status: {
        color: "success",
        message: (
          <span>
            <p>Transaction cancelled successfully!</p>
            <br />
            <a
              color="default"
              target="_blank"
              href={`https://sepolia.etherscan.io/tx/${txHash}`}
            >
              View the status of your transaction on Etherscan!
            </a>
          </span>
        ),
      },
    };
  } catch (err) {
    return {
      status: {
        color: "danger",
        message: "An error has occurred: " + err.message,
      },
    };
  }
};

export const confirmAssetTransfer = async (assetId) => {
  const { address: brandAddress, status } = await getCurrentWalletConnected();

  //set up transaction parameters
  const transactionParameters = {
    to: contractAddress, // Required except during contract publications.
    from: brandAddress, // must match user's active address.
    data: digitalOwnershipContract.methods
      .confirmTransferAsset(assetId)
      .encodeABI(),
  };

  //sign the transaction
  try {
    const txHash = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [transactionParameters],
    });
    return {
      status: {
        color: "success",
        message: (
          <span>
            <p>Asset transferred successfully!</p>
            <br />
            <a
              color="default"
              target="_blank"
              href={`https://sepolia.etherscan.io/tx/${txHash}`}
            >
              View the status of your transaction on Etherscan!
            </a>
          </span>
        ),
      },
    };
  } catch (err) {
    return {
      status: {
        color: "danger",
        message: "An error has occurred: " + err.message,
      },
    };
  }
};
