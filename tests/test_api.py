import sys
import unittest
import json

sys.path.insert(0, '.')
sys.path.insert(0, '../')

from server.server import app


class TestCase(unittest.TestCase):
    def setUp(self):
        app.config['TESTING'] = True
        self.app = app.test_client()

    def test_basic(self):
        response = self.app.get('/')
        self.assertEqual(response.data.decode(), "Hello World")

    def test_bus_stops(self):
        response = self.app.get('/bus_stops/803')
        self.assertEqual(response.data.decode(), "abc")

    def test_all_route_ids(self):
        response = self.app.get('/all_route_ids')
        bus_stops = response.data.decode()
        bus_stops_json = json.loads(bus_stops)
        for bus_stop in bus_stops_json:
            print('Get bus stops info for route: ' + bus_stop)
            bus_stop_response = self.app.get('/bus_stops/' + bus_stop)


if __name__ == '__main__':
    unittest.main()
