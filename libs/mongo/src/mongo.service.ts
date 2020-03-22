import { Injectable } from '@nestjs/common';
import { Db, MongoClient, MongoClientOptions } from 'mongodb';
import { ConfigService } from '@backend/config';
import { LoggerService } from '@backend/logger';
import { waitForSomeSeconds } from 'utils/time';

@Injectable()
export class MongoService {
  public db: Db;

  private client: MongoClient;
  private indexes: { collection: string; index: any }[] = [];
  private promises: any[] = [];

  constructor(private config: ConfigService, private logger: LoggerService) {
    this.init();
  }

  public async init() {
    let url = this.config.mongo.srv
      ? this.config.mongo.srv
      : this.config.mongo.user
      ? `mongodb://${this.config.mongo.user}:${this.config.mongo.password}@${this.config.mongo.host}:${this.config.mongo.port}`
      : `mongodb://${this.config.mongo.host}:${this.config.mongo.port}`;

    if (this.config.mongo.replicaSet) {
      url += `/replicaSet=${this.config.mongo.replicaSet}`;
    }

    const clientConfig: MongoClientOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      ssl: this.config.mongo.port === 443,
    };

    try {
      this.client = await MongoClient.connect(url, clientConfig);

      this.logger.debug('MongoDB client connected');
      this.db = this.client.db(this.config.mongo.database);

      this.indexes.forEach(({ collection, index }) => {
        this.db.collection(collection).createIndex(index);
      });
      this.promises.forEach(resolve => resolve());
    } catch (e) {
      this.logger.warn('MongoDB client connect failed. Retrying...');
      // console.warn(e);
      await waitForSomeSeconds(1500);
      this.init();
    }
  }

  public addIndex(collection: string, index: any) {
    this.indexes.push({ collection, index });
  }

  public async waitReady() {
    if (this.db) {
      return Promise.resolve();
    }
    return new Promise(resolve => this.promises.push(resolve));
  }

  public get isConnected(): boolean {
    return this.client && this.client.isConnected();
  }

  public async close(): Promise<void> {
    return this.client && this.client.close();
  }
}
