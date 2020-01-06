var cc = DataStudioApp.createCommunityConnector();

// https://developers.google.com/datastudio/connector/reference#isadminuser
function isAdminUser() {
  return false;
}

// https://developers.google.com/datastudio/connector/reference#getconfig
function getConfig(request) {
  var config = cc.getConfig();

  config
    .newInfo()
    .setId('generalInfo')
    .setText(
      'This is the template connector created by https://github.com/googledatastudio/dscc-gen'
    );

    config
	.newSelectMultiple()
	//.setIsDynamic(false) // When this line is uncommented and the next is commented, the units select will show
    	.setIsDynamic(true)  // When this line is uncommented and the previous line is commented, the units select does not show
	.setId('broken-select-multiple')
	.setName('Select Multiple')
	.addOption(
	    config.newOptionBuilder()
		.setLabel('Label 1')
		.setValue('Value 1')
	)
	.addOption(
	    config.newOptionBuilder()
		.setLabel('Label 2')
		.setValue('Value 2')
	);
    

  config
    .newSelectSingle()
    .setId('units')
    .setName('Units')
    .setHelpText('Metric or Imperial Units')
    .setAllowOverride(true)
    .addOption(
      config
        .newOptionBuilder()
        .setLabel('Metric')
        .setValue('metric')
    )
    .addOption(
      config
        .newOptionBuilder()
        .setLabel('Imperial')
        .setValue('imperial')
    );

  return config.build();
}

function getFields() {
  var fields = cc.getFields();
  var types = cc.FieldType;
  var aggregations = cc.AggregationType;

  fields
    .newDimension()
    .setId('id')
    .setName('Id')
    .setType(types.TEXT);

  fields
    .newMetric()
    .setId('distance')
    .setName('Distance')
    .setType(types.NUMBER)
    .setAggregation(aggregations.SUM);

  return fields;
}

// https://developers.google.com/datastudio/connector/reference#getschema
function getSchema(request) {
  return {schema: getFields().build()};
}

// https://developers.google.com/datastudio/connector/reference#getdata
function getData(request) {
  // Calling `UrlFetchApp.fetch()` makes this connector require authentication.
  UrlFetchApp.fetch('https://google.com');

  var requestedFields = getFields().forIds(
    request.fields.map(function(field) {
      return field.name;
    })
  );

  // Convert from miles to kilometers if 'metric' units were picked.
  var unitMultiplier = 1;
  if (request.configParams.units === 'metric') {
    unitMultiplier = 1.60934;
  }

  var rows = [];
  for (var i = 0; i < 100; i++) {
    var row = [];
    requestedFields.asArray().forEach(function(field) {
      switch (field.getId()) {
        case 'id':
          return row.push('id_' + i);
        case 'distance':
          return row.push(i * unitMultiplier);
        default:
          return row.push('');
      }
    });
    rows.push({values: row});
  }

  return {
    schema: requestedFields.build(),
    rows: rows,
  };
}
