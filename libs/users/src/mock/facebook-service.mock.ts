import { Public } from '@utils/public';
import { FacebookService } from '../auth/services/facebook.service';

export class MockFacebookService implements Public<FacebookService> {
  public getUserId = jest.fn();
}
