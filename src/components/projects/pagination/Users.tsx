import Maps from './Maps';
import { AddressCardIcon, EnvelopeIcon, GlobeIcon, PhoneIcon } from './icons';

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
    <div className="info">
      <ul className="p-list">
        {users.map((user) => (
          <li key={user.id} className="p-card">
            <div className="info">
              <p className="name">{user.name}</p>
              <div className="email">
                <div className="email-icon">
                  <EnvelopeIcon />
                </div>
                <div className="email-address">
                  <a href={'mailto:' + user.email}>{user.email}</a>
                </div>
              </div>
              <div className="address">
                <div className="address-icon">
                  <AddressCardIcon />
                </div>
                <div className="address-details">
                  <p>
                    {user.address.street}, {user.address.suite}
                  </p>
                  <p>{user.address.city}</p>
                  <p>{user.address.zipcode}</p>
                </div>
              </div>
              <div className="phone">
                <div className="phone-icon">
                  <PhoneIcon />
                </div>
                <div className="phone-number">{user.phone}</div>
              </div>
              <div className="website">
                <div className="website-icon">
                  <GlobeIcon />
                </div>
                <div className="website-url">
                  <a href={`https://${user.website}`} target="_new">
                    {user.website}
                  </a>
                </div>
              </div>
              <span style={{ fontSize: '11px' }}>
                Lat: {user.address.geo.lat}, Lng: {user.address.geo.lng}
              </span>
            </div>
            <div id={'map' + user.id} className="map">
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
