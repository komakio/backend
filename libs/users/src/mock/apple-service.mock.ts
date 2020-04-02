import { AppleService } from '../auth/services/apple.service';
import { Public } from '@utils/public';

export class MockAppleService implements Public<AppleService> {
  public getAppleId = jest.fn();
}
