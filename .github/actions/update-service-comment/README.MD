# Update Service Comment Action

The action is used to update a value inside a service comment.
Make sure to create it first by running a create-service-comment action.

## Inputs
### `auth-token`
**Required** String. GitHub auth token for Octokit authentication.

### `label`
**Required** String. List of placeholders for future use by other actions.

### `value`
**Required** Any. Used to specify whether placeholders should be bold or not.

### `create-if-not-found`
Boolean. Creates a new pair of label and value if the label is not found by name. Default `"False"`.

## Example usage
Updating a E2E status in a service comment after running e2e tests.
```yaml
tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - id: e2e
        name: e2e
        uses: actions/my-test-runner@v1
      - name: update-service-comment-with-test-result
        uses: vkhalikov/service-comment/update
        if: ${{ always() }}
        with:
          auth-token: ${{ secrets.GITHUB_TOKEN }}
          label: E2E Status
          value: ${{ steps.e2e.outcome }}
        continue-on-error: true
```
