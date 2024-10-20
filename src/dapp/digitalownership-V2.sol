//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract DigitalOwnership {
    struct DigitalAsset {
        string name;
        address owner;
        string metadata;
    }

    struct Transaction {
        string assetId;
        address from;
        address to;
        uint256 timestamp;
    }

    // Dictionary of ownership transfers indexed on assetId
    mapping(string => Transaction[]) private ownershipHistory;

    // Dictionary of assets
    mapping(string => DigitalAsset) private assets;
    mapping(address => string[]) private userAssets;

    address public immutable adminAddress;
    mapping(address => bool) private brandAddresses;

    // Constructor to set the immutable variable
    constructor(address _address) {
        adminAddress = _address;
    }

    // Function to register brand accounts
    function addBrandAccount(address _brandAddress) public {
        require(msg.sender == adminAddress, "You are not authorised to invoke this function");

        brandAddresses[_brandAddress] = true;
    }

    // Function to verify if a brand is registered
    function verifyBrandAddress(address _brandAddress) public view returns(bool) {
        return brandAddresses[_brandAddress];
    }

    function recoverSigner(bytes32 hash, bytes memory signature) public pure returns (address) {
		    bytes32 messageDigest = keccak256(
	        abi.encodePacked("\x19Ethereum Signed Message:\n32", hash)
            );
		    return ECDSA.recover(messageDigest, signature);
    }

    event AssetTransferred(string assetId, address indexed from, address indexed to);

    function registerAsset(string memory _assetId, string memory _name, string memory _metadata) public {
        require(brandAddresses[msg.sender], "You are not a registered brand");
        require(assets[_assetId].owner == address(0), "Asset already exists");
        DigitalAsset memory newAsset = DigitalAsset(_name, msg.sender, _metadata);
        assets[_assetId] = newAsset;

        // Record creation of asset
        recordTransaction(_assetId, msg.sender, msg.sender);
    }

    function registerAssetWithIPFS(string memory _assetId, string memory _name, string memory _ipfsHash) public {
        require(brandAddresses[msg.sender], "You are not a registered brand");
        require(assets[_assetId].owner == address(0), "Asset already exists");
        DigitalAsset memory newAsset = DigitalAsset(_name, msg.sender, _ipfsHash);
        assets[_assetId] = newAsset;

        // Record creation of asset
        recordTransaction(_assetId, msg.sender, msg.sender);
    }

    function transferAsset(string memory _assetId, address _newOwner) public {
        require(assets[_assetId].owner == msg.sender, "You are not the owner");
        assets[_assetId].owner = _newOwner;
        emit AssetTransferred(_assetId, msg.sender, _newOwner);

        // Record transfer of ownership
        recordTransaction(_assetId, msg.sender, _newOwner);
    }    
    
    function verifyOwner(string memory _assetId) public view returns(address) {
        return assets[_assetId].owner;
    }

    event AssetTransferredWithSignature(string assetId, address indexed from, address indexed to, bytes signature);

    function transferAssetWithSignature(string memory _assetId, address _newOwner, bytes memory _signature) public {
        bytes32 messageHash = keccak256(abi.encodePacked(_assetId, _newOwner));
        address signer = recoverSigner(messageHash, _signature);
        require(signer == assets[_assetId].owner, "Signature does not match with the asset's owner");
        assets[_assetId].owner = _newOwner;
        emit AssetTransferredWithSignature(_assetId, msg.sender, _newOwner, _signature);    
    }

    function addUserAsset(string memory _assetId) internal {
        userAssets[msg.sender].push(_assetId);
    }

    function getUserAssets(address _owner) public view returns(string[] memory) {
        return userAssets[_owner];
    }    

    // Get ownership history of a digital asset (public)
    function showOwnershipHistory(string memory _assetId) public view returns(Transaction[] memory){
        // require asset ID to exist
        require(ownershipHistory[_assetId].length > 0, "No transactions associated with this asset.");

        // Return array of transactions associated with the digital asset
        return ownershipHistory[_assetId];
    }  

    // Insert a transaction into the ownership history (public)
    function recordTransaction(string memory _assetId, address from, address to) internal {
        // Add the transaction into the array
        ownershipHistory[_assetId].push(Transaction(_assetId, from, to, block.timestamp));
    }
}