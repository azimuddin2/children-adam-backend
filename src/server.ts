import mongoose from 'mongoose';
import app from './app';
import { Server } from 'http';
import config from './app/config';
import chalk from 'chalk';

let server: Server;

async function main() {
  try {
    await mongoose.connect(config.database_url as string);
    console.log(
      chalk.green('✅ Connection to database is successfully established!'),
    );

    server = app.listen(config.port, () => {
      console.log(chalk.blue(`🚀 Server is running on port: ${config.port}`));
    });
  } catch (error) {
    console.log(chalk.red('❌ Error:', error));
  }
}

main();

process.on('unhandledRejection', (err) => {
  console.log(chalk.red(`😈 unhandledRejection detected, shutting down...`, err));
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.log(chalk.red(`😈 uncaughtException detected, shutting down...`));
  process.exit(1);
});
