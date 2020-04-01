import { NotificationsService } from '../notifications.service';
import { Public } from '@utils/public';

export class MockNotificationsService implements Public<NotificationsService> {
  public send = jest.fn();
}
