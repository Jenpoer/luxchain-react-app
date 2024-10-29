//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract DigitalOwnership {
    struct DigitalAsset {
        string name;
        address owner;
        string metadata;
    }

    enum TransactionStatus {
        Pending,
        Completed
    }
    struct Transaction {
        string assetId;
        address from;
        address to;
        uint256 timestamp;
        TransactionStatus status;
    }

    struct DigitalIdentity {
        string name;
        address _address;
        bool isBrand;
    }

    // Dictionary of ownership transfers indexed on assetId
    mapping(string => Transaction[]) private ownershipHistory;

    // Dictionary of assets
    mapping(string => DigitalAsset) private assets;

    // Dictionary of assets owned by user
    mapping(address => string[]) private userAssets;

    // Admin address
    address public immutable adminAddress;

    // Dictionary of digital identities (users and brands)
    mapping(address => DigitalIdentity) private digitalIdentities;

    // Dictionary of pending transactions (assetId => Transaction)
    mapping(string => Transaction) private pendingTransactions;

    // Constructor to set the immutable variable
    constructor(address _address) {
        adminAddress = _address;
    }

    // ---------------------------
    // Registration
    // ---------------------------

    // Function to register brand accounts
    function addBrandAccount(string memory _brandName, address _brandAddress) public {
        require(msg.sender == adminAddress, "You are not authorised to invoke this function");
        require(digitalIdentities[_brandAddress]._address == address(0), "Digital identity already exists");

        digitalIdentities[_brandAddress] = DigitalIdentity(_brandName, _brandAddress, true);
    }

    // Function to register new users
    function addUser(string memory _username, address _userAddress) public {
        require(digitalIdentities[_userAddress]._address == address(0), "Digital identity already exists");

        digitalIdentities[_userAddress] = DigitalIdentity(_username, _userAddress, false);
    }

    // ---------------------------
    // Retrieve Information
    // ---------------------------

    // Function to verify if a brand is registered
    function verifyBrandAddress(address _brandAddress) public view returns(bool) {
        if(digitalIdentities[_brandAddress]._address == address(0)) return false;
        return digitalIdentities[_brandAddress].isBrand;
    }

    // Function to get asset information
    function getAsset(string memory _assetId) public view returns(DigitalAsset memory) {
        return assets[_assetId];
    }

    // Verifies owner of the asset
    function verifyOwner(string memory _assetId) public view returns(address) {
        return assets[_assetId].owner;
    }

    // Function to get digital identity information
    function getDigitalIdentity(address _address) public view returns(DigitalIdentity memory) {
        return digitalIdentities[_address];
    }

    // Get all assets owned by a user
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

    // Get pending transaction of an asset
    function getPendingTransactions(string memory _assetId) public view returns(Transaction memory) {
        return pendingTransactions[_assetId];
    }

    // ---------------------------
    // Asset Transfer
    // ---------------------------

    // Asset transferred event
    event AssetTransferred(string assetId, address indexed from, address indexed to);

    // Register asset with IPFS hash
    function registerAssetWithIPFS(string memory _assetId, string memory _name, string memory _ipfsHash) public {
        require(verifyBrandAddress(msg.sender), "You are not a registered brand");
        require(assets[_assetId].owner == address(0), "Asset already exists");
        DigitalAsset memory newAsset = DigitalAsset(_name, msg.sender, _ipfsHash);
        assets[_assetId] = newAsset;

        // Record creation of asset
        recordTransaction(_assetId, msg.sender, msg.sender);
    }

    // Initiates a pending transfer to another user
    function initiateTransferAsset(string memory _assetId, address _newOwner) public {
        require(verifyOwner(_assetId) == msg.sender, "You are not the owner");
        require(digitalIdentities[_newOwner]._address != address(0), "This address is not associated with a digital identity");
        require(keccak256(bytes(pendingTransactions[_assetId].assetId)) != keccak256(bytes(_assetId)), 
            "There is already a pending transaction for this asset");

        // Record pending transaction
        pendingTransactions[_assetId] = Transaction(_assetId, msg.sender, _newOwner, block.timestamp, TransactionStatus.Pending);
    }

    // Transfers asset to another user
    function confirmTransferAsset(string memory _assetId) public {
        require(pendingTransactions[_assetId].status == TransactionStatus.Pending, "There are no pending transactions for this asset");
        require(pendingTransactions[_assetId].to == msg.sender, "You are not the intended recipient of this asset");
        
        // Temporarily store transaction information
        Transaction memory _transaction = pendingTransactions[_assetId];

        // Remove from pending transactions
        delete pendingTransactions[_assetId];
        
        // Remove asset from previous owner's list
        removeUserAsset(assets[_assetId].owner, _assetId);
        
        // Add asset to new owner's list
        assets[_assetId].owner = _transaction.to;
        addUserAsset(_assetId);

        // Record transfer of ownership
        recordTransaction(_assetId, _transaction.from, _transaction.to);

        emit AssetTransferred(_assetId, _transaction.from, _transaction.to);
    }    
    
    // Add an asset to a user
    function addUserAsset(string memory _assetId) internal {
        userAssets[msg.sender].push(_assetId);
    }

    // Remove asset from owner's list
    function removeUserAsset(address owner, string memory _assetId) internal {
        string[] storage ownedItems = userAssets[owner];
        for (uint256 i = 0; i < ownedItems.length; i++) {
            if (keccak256(bytes(ownedItems[i])) == keccak256(bytes(_assetId))) {
                ownedItems[i] = ownedItems[ownedItems.length - 1];
                ownedItems.pop();
                break;
            }
        }
    } 

    // Insert a transaction into the ownership history (public)
    function recordTransaction(string memory _assetId, address from, address to) internal {
        // Add the transaction into the array
        ownershipHistory[_assetId].push(Transaction(_assetId, from, to, block.timestamp, TransactionStatus.Completed));
    }

    function cancelTransaction(string memory _assetId) public {
        require(pendingTransactions[_assetId].to == msg.sender || pendingTransactions[_assetId].from == msg.sender, 
            "You are not a participant of the transaction");

        // Remove transaction
        delete pendingTransactions[_assetId];
    }
    
}