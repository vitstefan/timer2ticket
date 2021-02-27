import { Constants } from './constants';
import { Collection, Db, MongoClient, ObjectId } from "mongodb";
import { User } from '../models/user';
import { TimeEntrySyncedObject } from '../models/synced_service/time_entry_synced_object/time_entry_synced_object';

export class DatabaseService {
  private static _mongoDbName = 'timer2ticketDB';
  private static _usersCollectionName = 'users';
  private static _timeEntrySyncedObjectsCollectionName = 'timeEntrySyncedObjects';

  private static _instance: DatabaseService;

  private _mongoClient: MongoClient | undefined;
  private _db: Db | undefined;

  private _usersCollection: Collection<User> | undefined;
  private _timeEntrySyncedObjectsCollection: Collection<TimeEntrySyncedObject> | undefined;

  private _isReady = false;
  isReady = (): boolean => this._isReady;

  public static get Instance(): DatabaseService {
    return this._instance || (this._instance = new this());
  }

  /**
   * Private empty constructor to make sure that this is correct singleton
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() { }

  /**
   * Needs to be called (and awaited) to correctly connect to the database
   */
  public async init(): Promise<boolean> {
    // Make a connection to MongoDB Service
    this._mongoClient = new MongoClient(Constants.mongoDbUrl, { useUnifiedTopology: true });

    await this._mongoClient.connect();
    console.log("Connected to MongoDB!");

    if (!this._mongoClient) return false;

    this._db = this._mongoClient.db(DatabaseService._mongoDbName);

    this._usersCollection = this._db.collection(DatabaseService._usersCollectionName);
    this._timeEntrySyncedObjectsCollection = this._db.collection(DatabaseService._timeEntrySyncedObjectsCollectionName);

    return true;
  }

  private _close() {
    this._mongoClient?.close();
  }

  async getUser(username: string): Promise<User | null> {
    if (!this._usersCollection) return null;

    const filterQuery = { username: username };
    return this._usersCollection.findOne(filterQuery);
  }

  async updateUser(user: User): Promise<User | null> {
    if (!this._usersCollection) return null;

    const filterQuery = { _id: new ObjectId(user._id) };

    const result = await this._usersCollection.replaceOne(filterQuery, user);
    return result.modifiedCount === 1 ? result.ops[0] : null;
  }

  async getTimeEntrySyncedObjects(user: User): Promise<TimeEntrySyncedObject[] | null> {
    if (!this._timeEntrySyncedObjectsCollection) return null;

    const filterQuery = { userId: new ObjectId(user._id) };
    return this._timeEntrySyncedObjectsCollection.find(filterQuery).toArray();
  }
}

export const databaseService = DatabaseService.Instance;