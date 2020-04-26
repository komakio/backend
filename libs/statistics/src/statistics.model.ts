import { UsersStatistics } from '@backend/users/users.model';
import { ProfilesStatistics } from '@backend/profiles/profile.model';
import { RequestsStatistics } from '@backend/requests/requests.model';

export class Statistics {
  public users: UsersStatistics;
  public profiles: ProfilesStatistics;
  public requests: RequestsStatistics;
}
