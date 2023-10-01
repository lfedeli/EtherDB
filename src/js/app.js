App = {
  message: "",
  web3Provider: null,
  contracts: {},
  supportAccounts: null,

  init: async function() {
    return await App.initWeb3();
  },

  initWeb3: async function() {
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.enable();
      } catch (error) {
        // User denied account access...
        console.error("User denied account access")
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);

    App.web3ProviderSupport = new Web3.providers.HttpProvider('http://localhost:7545');
    web3Support = new Web3(App.web3ProviderSupport);

    web3Support.eth.getAccounts(function(error, accounts) { 
        if (error) {
                   console.log(error);
                 }
            App.supportAccounts = accounts;
        console.log("Supporting accounts ", App.supportAccounts);
    });

    
        return App.initContract();
      },

  initContract: function() {
    $.getJSON('contract_details/TransactionDB.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with @truffle/contract
	
	  console.log("Contract initialized")
      var TransactionDBArtifact = data;
      App.contracts.TransactionDB = TruffleContract(TransactionDBArtifact);
    
      // Set the provider for our contract
      App.contracts.TransactionDB.setProvider(App.web3Provider);
    });

  }
};

$(document).ready(function () {
  App.init();

  $.get('/getAll', function(response) {
    loadHTMLTable(response['data'])
  }); 

});


 $('table tbody').bind('click', function(event) {
	 if (event.target.className === "delete-row-btn") {
	     deleteRowById(event.target.dataset.id);
	 }
	if (event.target.className === "edit-row-btn"){
	   handleEditRow(event.target.dataset.id);
	}
  });

  const updateBtn = $("#update-row-btn");
  const searchBtn = $("#search-btn");



$("#search-btn").on("click", function() {
  web3.eth.getAccounts(function(error, accounts) {
    if (error) {
      console.log(error);
    }
    
    var account = accounts[0];
    message = "You need to pay a fee";

    App.contracts.TransactionDB.deployed().then(function(instance) {
      transactionInstance = instance;
      return transactionInstance.fund({ from: account, value: '100000000000000000'});
    }).then(function(result) {
      const searchValue = $("#search-input").val();
      $.get('/search', { 'name': searchValue }, function(response) {
        loadHTMLTable(response['data']);
      });
    }).catch(function(err) {
      console.log(err.message);
    });
  });
});


function deleteRowById(id){
   $.ajax(
   {
    url: '/delete',
	data: {'id' : id},
    type: 'DELETE',
    success: function(response){
		if (response.success){
          location.reload();			
		}}
	})}


function handleEditRow(id){
    $("#update-row").prop("hidden", false);
	$('#update-row-btn').attr("data-id", id);

}


$("#update-row-btn").on("click", function() {
  const updateNameInput = $("#update-name-input");
  const IdIn = $("#update-row-btn").data("id");

  $.ajax({
    url: 'http://localhost:5000/update',
    method: 'PATCH',
    headers: {
      "Content-type": 'application/json'
    },
    data: JSON.stringify({
      id: IdIn,
      name: updateNameInput.val()
    }),
    success: function(data) {
      if (data.success) {
        location.reload();
      }
    }
  });
});


$("#add-name-btn").on("click", function() {

    web3.eth.getAccounts(function(error, accounts) {
       if (error) {
       console.log(error);
      }

    var account = accounts[0];


    App.contracts.TransactionDB.deployed().then(function(instance) {
      transactionInstance = instance;
      return transactionInstance.fund({ from: account, value: '100000000000000000'});
    }).then(function(result) { 

      const nameInput = $("#name-input");
      const name = nameInput.val();
      nameInput.val("");

      $.ajax({
              url: 'http://localhost:5000/insert',
              method: 'POST',
              headers: {
                        'Content-type': 'application/json'
                      },
              data: JSON.stringify({ name: name }),
              success: function(data) {
                        insertRowIntoTable(data.data);
                      }
            });
     }).catch(function(err){
          console.log(err.message);
    });
  });
});


function insertRowIntoTable(data) {
      const table = $("table tbody");
      const isTableData = table.find(".no-data");

      let tableHtml = "<tr>";

      for (var key in data) {
              if (data.hasOwnProperty(key)) {
                        if (key === "dateAdded") {
                                    data[key] = new Date(data[key]).toLocaleString();
                                  }
                      }
              tableHtml += `<td>${data[key]}</td>`;
            }

      tableHtml += `<td><button class="delete-row-btn" data-id="${data.id}">Delete</td>`;
      tableHtml += `<td><button class="edit-row-btn" data-id="${data.id}">Edit</td>`;

      tableHtml += "</tr>";

      if (isTableData.length) {
              table.html(tableHtml);
            } else {
                    table.append(tableHtml);
                  }
}


function loadHTMLTable(data) {
      const table = $("table tbody");
      if (data.length === 0) {
              table.html("<tr><td class='no-data' colspan='5'>No Data</td></tr>");
              return;
            }

      let tableHtml = "";

      data.forEach(function ({ id, name, date_added }) {
              tableHtml += "<tr>";
              tableHtml += `<td>${id}</td>`;
              tableHtml += `<td>${name}</td>`;
              tableHtml += `<td>${new Date(date_added).toLocaleString()}</td>`;
              tableHtml += `<td><button class="delete-row-btn" data-id="${id}">Delete</td>`;
              tableHtml += `<td><button class="edit-row-btn" data-id="${id}">Edit</td>`;
              tableHtml += "</tr>";
            });

      table.html(tableHtml);
}


// Function to show the message
function showMessage(buttonId) {
  let message = "";

  // Check the button id to determine the message
  if (buttonId === "search-btn") {
    message = "You need to pay a fee for searching an item";
  } else if (buttonId === "add-name-btn") {
    message = "You need to pay a fee for adding an item in the DB";
  } else {
    message = "Default message";
  }

  window.alert(message);
}

