import { UsersStatistics } from '@backend/users/users.model';
import { RequestsStatistics } from '@backend/requests/requests.model';
import { ProfilesStatistics } from '@backend/profiles/profiles.model';

export class Statistics {
  public users: UsersStatistics;
  public profiles: ProfilesStatistics;
  public requests: RequestsStatistics;
}
