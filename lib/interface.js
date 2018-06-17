#!/usr/bin/env node

/**
 * Module dependencies.
 */
const program = require('commander'),
    version = '1.0.3';

program
    .version(version)
    .usage('input output [options] [command]')
    .description('');

program
    .option('-v', 'version', console.log(version));

program
program
    .command('filter')
    .option('-i --input <dir>', 'Directory')
    .option('-o --output <dir>', 'Directory')
    .alias('f')
    .action(require('./filter'));

program
    .parse(process.argv);

module.exports = program;