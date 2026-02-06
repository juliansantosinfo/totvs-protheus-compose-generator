# Testing

## Running Tests

Open `tests.html` in your browser to run the unit tests.

```bash
# Using Python
python3 -m http.server 8000

# Then open
http://localhost:8000/tests.html
```

## Test Coverage

The test suite covers:

- ✅ YAML generation
- ✅ Service inclusion (postgres, mssql, appserver, apprest, smartview)
- ✅ External database handling
- ✅ Bind mounts vs named volumes
- ✅ Environment variables
- ✅ Healthchecks
- ✅ Dependencies
- ✅ Error handling
- ✅ SmartView discovery URL

## Adding New Tests

Add new tests in `tests.html` using the `test()` function:

```javascript
test('test description', () => {
    const config = getMinimalConfig();
    const result = generateDockerCompose(config);
    assertContains(result, 'expected_string', 'error message');
});
```

## Assertions Available

- `assert(condition, message)` - Basic assertion
- `assertEquals(actual, expected, message)` - Equality check
- `assertContains(str, substring, message)` - String contains check
