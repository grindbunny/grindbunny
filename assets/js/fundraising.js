window.onload = async function() {
    var investBtn = document.getElementById("investBtn");
    var ethAmount = document.getElementById("ethAmount");
    var usdValue = document.getElementById("usdValue");
    var claimBtn = document.getElementById("claimBtn");
    console.log("Fundraising script loaded!")
    // Initialize Web3
    if (window.ethereum) {
        window.web3 = new Web3(ethereum);
        await ethereum.enable();
    }
    else if (window.web3) {
        window.web3 = new Web3(web3.currentProvider);
    }

    // Load your contract's ABI
    let response = await fetch('assets/js/contractABI.json');
    let abi = await response.json();

    // Initialize your fundraising contract
    const contractAddress = '0x97598d924e8dc390c03d9566c9f92727de2039ad';
    let contract = new web3.eth.Contract(abi, contractAddress);

    // Fetch ETH price when the page loads and store it in localStorage
    let ethUsdPrice = localStorage.getItem('ethUsdPrice');
    if (!ethUsdPrice) {
        fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd')
            .then(response => response.json())
            .then(data => {
                localStorage.setItem('ethUsdPrice', data.ethereum.usd);
            });
    }

    // Function to convert ETH to USD, and disable/enable invest button
    ethAmount.onkeyup = function() {
        let ethUsdPrice = parseFloat(localStorage.getItem('ethUsdPrice'));
        usdValue.textContent = "USD Value: $" + (ethUsdPrice * ethAmount.value).toFixed(2);

        if (ethAmount.value <= 0) {
            investBtn.disabled = true;
        } else {
            investBtn.disabled = false;
        }
    }

    ethAmount.onchange = function() {
        if (ethAmount.value <= 0) {
            investBtn.disabled = true;
        } else {
            investBtn.disabled = false;
        }
    }

    // Function to initiate investment transaction
    investBtn.onclick = async function() {
        let accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        let account = accounts[0];
        
        contract.methods.contribute().send({ from: account, value: web3.utils.toWei(ethAmount.value, 'ether') })
            .on('transactionHash', function(hash){
                console.log('transactionHash', hash);
            })
            .on('confirmation', function(confirmationNumber, receipt){
                console.log('confirmation: ' + confirmationNumber);
            })
            .on('receipt', function(receipt){
                console.log('receipt', receipt);
            })
            .on('error', console.error);
    }

        // Function to claim tokens
        claimBtn.onclick = async function() {
            let accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            let account = accounts[0];
    
            contract.methods.contributorClaimCBUNTokens().send({ from: account })
                .on('transactionHash', function(hash){
                    console.log('transactionHash', hash);
                })
                .on('confirmation', function(confirmationNumber, receipt){
                    console.log('confirmation: ' + confirmationNumber);
                })
                .on('receipt', function(receipt){
                    console.log('receipt', receipt);
                })
                .on('error', console.error);
        }
        var addTokenBtn = document.getElementById("addToken"); // Add this line at the top with your other variable declarations.

        // Below Function Adds the token to the wallet, MUST BE UPDATED BEFORE OFFICIAL DEPLOYMENT!
        addTokenBtn.onclick = async function() {
            const tokenAddress = '0x90B9A5CdcF5304714C33FA4a0c25681949eAA2d2'; // replace with your token contract address
            const tokenSymbol = 'GBUN'; // replace with your token symbol
            const tokenDecimals = 18; // replace with your token's decimals
            const tokenImage = 'https://raw.githubusercontent.com/grindbunny/grindbunny/main/images/grindbunnytokenround.png?ignoreCache=true'; // use the raw version, the cache makes sure that the image is always loaded into metamask
    
            try {
                const wasAdded = await ethereum.request({
                    method: 'wallet_watchAsset',
                    params: {
                        type: 'ERC20',
                        options: {
                            address: tokenAddress,
                            symbol: tokenSymbol,
                            decimals: tokenDecimals,
                            image: tokenImage,
                        },
                    },
                });
    
                if (wasAdded) {
                    console.log('Token was successfully added to MetaMask!');
                } else {
                    console.log('Token was not added to MetaMask.');
                }
            } catch (error) {
                console.error('An error occurred: ', error.message);
            }
        };
    

    
};

//Below makes the copying of the contract ID possible
async function copyContractId() {
    var copyText = document.getElementById("contractId").value;
    try {
        await navigator.clipboard.writeText(copyText);
        //alert("Contract ID copied: " + copyText);
    } catch (err) {
        //console.error('Failed to copy text: ', err);
    }
}

