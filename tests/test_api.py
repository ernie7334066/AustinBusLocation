import sys
import unittest

sys.path.insert(0, '.')
sys.path.insert(0, '../')

from server.server import app


class TestCase(unittest.TestCase):
    def setUp(self):
        app.config['TESTING'] = True
        self.app = app.test_client()

    def test_basic(self):
        response = self.app.get('/')
        assert response.data == "Hello World"

    def test_bus_stops(self):
        try:
            response = self.app.get('/bus_stops/990')
        except Exception:
            self.fail("/bus_stops/990 raised Exception unexpectedly!")
        # assert response.data == "abc"


if __name__ == '__main__':
    unittest.main()
