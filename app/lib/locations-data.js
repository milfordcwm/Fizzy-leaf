export const LOCATION_CITIES = [
  'all',
  "Thompson's Station",
  'Spring Hill',
  'Franklin',
  'Columbia',
  'Nashville',
  'Old Hickory',
  'College Grove',
];

export const LOCATIONS = [
  {
    city: "Thompson's Station",
    name: '1819 Coffee',
    addr: "4683 Columbia Pike, Thompson's Station, TN 37179",
  },
  {
    city: "Thompson's Station",
    name: 'White Shepherd Coffee',
    addr: "2101 Branford Pl Unit 101, Thompson's Station, TN 37179",
  },
  {
    city: "Thompson's Station",
    name: 'Settlers Coffee',
    addr: "1990 Tollgate Blvd, Thompson's Station, TN 37179",
  },
  {
    city: 'Spring Hill',
    name: 'White Shepherd Coffee',
    addr: '4001 Parkfield Loop N Ste 40, Spring Hill, TN 37174',
  },
  {
    city: 'Columbia',
    name: "Mama Mila's",
    addr: '1200 S Garden St, Columbia, TN 38401',
  },
  {
    city: 'Spring Hill',
    name: 'Old Stone Creamery',
    addr: '2301 Sugar Ridge Rd, Spring Hill, TN 37174',
  },
  {
    city: 'Spring Hill',
    name: 'Awaken House',
    addr: '3035 Reserve Blvd, Spring Hill, TN 37174',
  },
  {
    city: 'Franklin',
    name: 'High Brow Coffee',
    addr: '188 Front St Unit 102, Franklin, TN 37064',
  },
  {
    city: 'Franklin',
    name: 'The Good Cup',
    addr: '2181 Hillsboro Rd, Franklin, TN 37069',
  },
  {
    city: 'Spring Hill',
    name: 'The Brunch Collective',
    addr: '5323 Main St, Spring Hill, TN 37174',
  },
  {
    city: 'Franklin',
    name: 'The Coffee House (Downtown Franklin)',
    addr: '144 2nd Ave N, Franklin, TN 37064',
  },
  {
    city: 'Franklin',
    name: 'The Franklin Bakehouse',
    addr: '100 E Main St, Franklin, TN 37064',
  },
  {
    city: 'Spring Hill',
    name: 'Abundant Provisions',
    addr: '5322 Main St, Spring Hill, TN 37174',
  },
  {
    city: 'Columbia',
    name: "Bruno's Italian Deli & Market",
    addr: '2500 Hospitality Ln, Columbia, TN 38401',
  },
  {
    city: 'Columbia',
    name: 'Legacy Coffee Co',
    addr: '2549 Nashville Hwy Ste B, Columbia, TN 38401',
  },
  {
    city: 'Franklin',
    name: 'North Arrow Coffee Co',
    addr: '406 Church St, Franklin, TN 37064',
  },
  {
    city: 'Columbia',
    name: 'Columbia Health Foods',
    addr: '106 W 7th St, Columbia, TN 38401',
  },
  {
    city: 'Franklin',
    name: 'SOS Counter',
    addr: '701 Cool Springs Boulevard, Franklin, TN 37067',
  },
  {
    city: 'Nashville',
    name: 'Canine Concepts',
    addr: '1106 Division St, Nashville, TN 37203',
  },
  {
    city: 'Nashville',
    name: 'Prickly Pear (Batman)',
    addr: '333 Commerce St, Nashville, TN 37201',
  },
  {
    city: 'Nashville',
    name: 'Prickly Pear (Albion)',
    addr: '645 Division St, Nashville, TN 37203',
  },
  {
    city: 'Nashville',
    name: 'Dose (West Nashville)',
    addr: '3431 Murphy Rd, Nashville, TN 37203',
  },
  {
    city: 'Nashville',
    name: 'Dose (East Nashville)',
    addr: '1400 McGavock Pike, Nashville, TN 37216',
  },
  {
    city: 'Old Hickory',
    name: 'Dose (Old Hickory)',
    addr: '700 Hadley Ave, Old Hickory, TN 37138',
  },
  {
    city: 'Brentwood',
    name: 'Raven Book Lounge',
    addr: '330 Franklin Rd #250b, Brentwood, TN 37027',
  },
  {
    city: 'Brentwood',
    name: 'Silver Fox (Brentwood)',
    addr: '7010 Executive Center Dr. Suite 106, Brentwood, TN 37027',
  },
  {
    city: 'Nashville',
    name: 'Silver Fox (Nashville)',
    addr: '1001 16th Ave S, Nashville, TN 37203',
  },
  {
    city: 'Nashville',
    name: 'Humphreys Street Coffee',
    addr: '424 Humphreys St, Nashville, TN 37203',
  },
  {
    city: 'College Grove',
    name: 'Delvin Farms',
    addr: '6361 Cox Rd, College Grove, TN 37046',
  },
  {
    city: 'Franklin',
    name: 'Honest Coffee (Berry Farms)',
    addr: '4000 Hughes Crossing #120, Franklin, TN 37064',
  },
  {
    city: 'Franklin',
    name: 'Honest Coffee (The Factory at Franklin)',
    addr: '230 Franklin Rd #11a, Franklin, TN 37064',
  },
  {
    city: 'Nashville',
    name: 'Honest Coffee (West Nashville)',
    addr: '3820 Charlotte Ave #135, Nashville, TN 37209',
  },
];

export const OVERVIEW_MAP_SRC =
  'https://maps.google.com/maps?q=35.85,-86.90&z=9&output=embed';

export function embedMapSrc(query, zoom) {
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=${zoom}&output=embed`;
}

export function mapSrcForCity(city) {
  return city === 'all' ? OVERVIEW_MAP_SRC : embedMapSrc(`${city}, TN`, 12);
}

export function mapSrcForShop(shop) {
  return embedMapSrc(`${shop.name} ${shop.addr}`.trim(), 15);
}

export function cityFilterLabel(city) {
  return city === 'all' ? 'All Locations' : city;
}
