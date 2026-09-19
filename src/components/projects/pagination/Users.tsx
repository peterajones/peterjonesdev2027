import Maps from './Maps';
import { AddressCardIcon, EnvelopeIcon, GlobeIcon, PhoneIcon } from './icons';
import styles from './Pagination.module.css';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  website: string;
  address: {
    street: string;
    suite: string;
    city: string;
    zipcode: string;
    geo: { lat: string; lng: string };
  };
}

interface Props {
  users: User[];
  loading: boolean;
}

export default function Users({ users, loading }: Props) {
  if (loading) {
    return (
      <img
        src="/images/code/Spinner-0.7s-100px.gif"
        alt="spinner"
        width={50}
        height={50}
        className="spinner"
      />
    );
  }

  if (!users || users.length === 0) {
    return <div>No users found</div>;
  }

  return (
    <div className={styles.info}>
      <ul className={styles.pList}>
        {users.map((user) => (
          <li key={user.id} className={styles.pCard}>
            <div className={styles.info}>
              <p className={styles.name}>{user.name}</p>
              <div className={styles.email}>
                <div className={styles.emailIcon}>
                  <EnvelopeIcon />
                </div>
                <div className={styles.emailAddress}>
                  <a href={'mailto:' + user.email}>{user.email}</a>
                </div>
              </div>
              <div className={styles.address}>
                <div className={styles.addressIcon}>
                  <AddressCardIcon />
                </div>
                <div className={styles.addressDetails}>
                  <p>
                    {user.address.street}, {user.address.suite}
                  </p>
                  <p>{user.address.city}</p>
                  <p>{user.address.zipcode}</p>
                </div>
              </div>
              <div className={styles.phone}>
                <div className={styles.phoneIcon}>
                  <PhoneIcon />
                </div>
                <div className={styles.phoneNumber}>{user.phone}</div>
              </div>
              <div className={styles.website}>
                <div className={styles.websiteIcon}>
                  <GlobeIcon />
                </div>
                <div className={styles.websiteUrl}>
                  <a href={`https://${user.website}`} target="_new">
                    {user.website}
                  </a>
                </div>
              </div>
              <span style={{ fontSize: '11px' }}>
                Lat: {user.address.geo.lat}, Lng: {user.address.geo.lng}
              </span>
            </div>
            <div id={'map' + user.id} className={styles.map} data-testid="map">
              <Maps
                lat={user.address.geo.lat}
                lng={user.address.geo.lng}
                name={user.name}
                location={user.address.city}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
