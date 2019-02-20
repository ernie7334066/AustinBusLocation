import sys
import unittest
import json

sys.path.insert(0, '.')
sys.path.insert(0, '../')

from server.server import app


def check_bus_stop_keys(unittest, bus_stops):
    for bus_stop_dict in bus_stops:
        expected = dict(lat=0, lng=0, stop_id=5880, trip_dir=0)
        for key in expected:
            unittest.assertIn(key, set(bus_stop_dict.keys()))
            expected[key] = bus_stop_dict[key]
        unittest.assertDictEqual(bus_stop_dict, expected)

class TestCase(unittest.TestCase):
    def setUp(self):
        app.config['TESTING'] = True
        self.app = app.test_client()

    def test_basic(self):
        response = self.app.get('/')
        self.assertEqual(response.data.decode(), "Hello World")

    def test_all_route_ids(self):
        response = self.app.get('/all_route_ids')
        route_ids = response.data.decode()
        route_ids_json = json.loads(route_ids)
        for route_id in route_ids_json:
            print('Get bus stops info for route: ' + route_id)
            bus_stop_response = self.app.get('/bus_stops/' + route_id)
            bus_stops = bus_stop_response.data.decode()
            bus_stops_json = json.loads(bus_stops)
            check_bus_stop_keys(self, bus_stops_json)


if __name__ == '__main__':
    unittest.main()
