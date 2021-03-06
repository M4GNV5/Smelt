var os = require('os');
var fs = require('fs');
var path = require('path');
var chalk = require('chalk');
var jsonOverride = require('json-override');

var Program = require("./Program");

var Settings = 
{
    Current : null,
    Default: null,
    Global: null,
    Local: null,
    GlobalPath : null,
    LocalPath : null,
    GlobalExists : false,
    LocalExists : false,

    ReadConfigs : function()
    {
        Settings.GlobalPath = Program.HomeDirectory + "/config.json";
        Settings.LocalPath = path.resolve(".smelt/config.json");
        
        // First, use the default config.json packaged with program.
        var defaultsFile = path.resolve(Program.OcDirectory + "/configuration/defaultValues.json");
        Settings.Default = Settings.ReadJsonFile(defaultsFile);
        
        // Second, look for a GLOBAL config file to override above.
        Settings.Global = Settings.ReadJsonFile(Settings.GlobalPath);
        Settings.GlobalExists = (Settings.Global != null);
        
        // Third, look for a LOCAL specific config to override above.
        Settings.Local = Settings.ReadJsonFile(Settings.LocalPath);
        Settings.LocalExists = (Settings.Local != null);

        // Set "Current" to equal the sum of all
        Settings.Current = Settings.Default;
        if(Settings.Global != null)
            Settings.Current = jsonOverride(Settings.Current, Settings.Global, true);
        if(Settings.Local != null)
            Settings.Current = jsonOverride(Settings.Current, Settings.Local, true);
    },
    GetDescriptions : function()
    {
        var filepath = path.resolve(Program.OcDirectory + "/configuration/descriptions.json");
        return Settings.ReadJsonFile(filepath);
    },
    GetValidValues : function()
    {
        var filepath = path.resolve(Program.OcDirectory + "/configuration/validValues.json");
        return Settings.ReadJsonFile(filepath);
    },
    ReadJsonFile : function(filePath)
    {
        var json = null;
        try 
        {
            // Look to see if configPath exists
            filePath = path.resolve(filePath);
            var contentString = fs.readFileSync(filePath);
            var contentJSON = JSON.parse(contentString);
            if(contentJSON != null)
            {
                // Found it
                json = contentJSON;
            }
        } 
        catch (err) 
        {
            // console.log(chalk.red.bold("    " + err));
            // console.log(chalk.red.bold("Not found: " + configPath + "!"));
        }
        return json;
    },
    GetConfig : function(options)
    {
        // Start with default app settings
        var template = Settings.Default;

        if(options.includeGlobal)
        {
            // If a global config exists, override default settings with this
            if(Settings.GlobalExists)
                template = jsonOverride(template, Settings.Global, true);
        }

        if(options.includeLocal)
        {
            // If a global config exists, override default settings with this
            if(Settings.LocalExists)
                template = jsonOverride(template, Settings.Local, true);
        }

        return template;
    },
    OutputDebugInfo: function()
    {
        if(Settings.Current.Output.ShowDebugInfo)
        {
            console.log(chalk.bold("\n\n* Using settings:"))
			console.log("  " + JSON.stringify(Settings.Current, null, 4));
        }
    }
}

module.exports = Settings;