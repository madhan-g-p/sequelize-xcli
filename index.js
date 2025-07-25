#!/usr/bin/env node
'use strict';
require("dotenv").config();
const { program, Option } = require('commander');
const pckg = require('./package.json');
const chalk = require("chalk");
const initDatabase = require("./lib/initDatabase");
const generateModel = require("./lib/generateModel");
const generateMigraion=require("./lib/generateMigration");
const { log } = require("./lib/logHelpers");

function introLog() {
  if (process.env.XCLI_TEST) return; // skip intro in tests
  log();
  log(chalk.underline(chalk.green.bold(` ${pckg.name} [V: ${pckg.version}]`), ` [Node: ${process.version.replace('v', '')} ]`));
  log();
}
introLog();
program.usage("[command] [options]")
program.name(pckg.name).version(pckg.version).description(pckg.description);


program.command("init:db").description("Initializes database configuration file")
  .option("-e, --envs [items]","Specify DB envs you needed as comma separated",
    (val,prev)=> val ? val.split(",").map(item=>item.trim()): prev, ['local','dev','prod']
  )
  .option("-f, --force", "Forcefully recreates the database configuration")
  .action(async(options)=>await initDatabase(options));
  program.command("init:model").description("Initializes model folder");

  program
  .command('model')
  .description('Generate a Sequelize model')
  .requiredOption("--mn, --model-name <model-name>","Define Model Name")
  .requiredOption("--tn, --table-name <table-name>","Define Table Name")
  .requiredOption('-a, --attributes <attributes>', 'Define model attributes as comma-separated')
  .option('-p, --primary [field]', 'Set primary key',"id")
  .option('--omit-id', 'Omit id column from the model',false)
  .option('-i, --index [fields]', 'Define indexed fields as comma-separated')
  .option('--fn, --foreign [fields]', 'Define foreign keys in format ` field1:references{table,column}-field2:references{table2,column2}` as hyphen separated for multiple foreign keys ')
  .option('-u, --unique [fields]', 'Define unique constraints as comma-separated fields')
  .option('--cu, --combo-unique [field1,field2],[field3,field4]', 'Define composite unique constraints comma-separated combos')
  .option('--soft-delete', 'Enable soft delete, adds deletedAt column',false)
  .option("-f, --force", "Forcefully recreates the Model file")
  .addOption(new Option("-t, --timestamps [format]",'Enable timestamps (camel | snake)').choices([false,"camel","snake"]).default(false))
  .action(generateModel);

program.command('migration')
  .description("Generates Migration file for the model")
  .option("--mp, --model-path [model-path]","Define path of model to refer to")
  .option("--fn, --file-name [file-name]","Define name of the migration file")
  .action(generateMigraion);

program.parse();
