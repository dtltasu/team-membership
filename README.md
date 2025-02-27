# multi-team-membership

[GitHub Action](https://github.com/features/actions) to get the list of teams a user belongs in a given organization.
It can also be optionally used to check if the user belongs to a given team

It emits one outputs which are available via the `steps` [output context](https://docs.github.com/en/actions/reference/context-and-expression-syntax-for-github-actions#steps-context)

* `isTeamMember` - A boolean indicating if a user belongs to a given team

# Usage

See [action.yml](action.yml)

Checks if the user who triggered the worfklow (actor) doesn't belong to the `octocats` team

```yaml
-  uses: dtltasu/multi-team-membership@1.0
   id: checkUserMember
   with:
     username: ${{ github.actor }}
     team: " octocats, teamlead, "
- if: ${{ steps.checkUserMember.outputs.isTeamMember == 'true' }}
  ...
```

## License

The scripts and documentation in this project are released under the [MIT License](LICENSE)
