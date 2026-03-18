# Human Readable Post

A GitHub Action that generates human-readable release summaries from git diffs using LLMs. Perfect for Slack notifications, release notes, and team updates.

Instead of "branch main was deployed", your team sees:

> Added user avatar upload with image resizing. Fixed a bug where session tokens weren't refreshed on password change. Updated the dashboard query to reduce load times by ~40%.

## Quick Start

```yaml
- uses: actions/checkout@v4
  with:
    fetch-depth: 2

- name: Generate release summary
  id: summary
  uses: wvides/human-readable-post@v1
  with:
    provider: openai
    api_key: ${{ secrets.OPENAI_API_KEY }}

- name: Post to Slack
  uses: slackapi/slack-github-action@v2
  with:
    webhook: ${{ secrets.SLACK_WEBHOOK }}
    webhook-type: incoming-webhook
    payload: |
      text: "Deployed to production:\n${{ steps.summary.outputs.summary }}"
```

## Inputs

| Input | Required | Default | Description |
|---|---|---|---|
| `provider` | **yes** | — | `openai`, `anthropic`, or `mistral` |
| `api_key` | **yes** | — | API key for the chosen provider |
| `model` | no | see below | Override the default model |
| `diff_mode` | no | `commit` | `commit`, `ref`, or `tag` |
| `base_ref` | no | — | Base ref for comparison (required when `diff_mode=ref`) |
| `max_diff_size` | no | `4000` | Max diff characters sent to the LLM |
| `language` | no | `english` | Language for the summary |
| `custom_prompt` | no | — | Extra instructions for the LLM |

## Outputs

| Output | Description |
|---|---|
| `summary` | Human-readable summary (2-6 lines) |

## Providers & Default Models

| Provider | Default Model | Approx. Cost/Run |
|---|---|---|
| `openai` | `gpt-4o-mini` | ~$0.001 |
| `anthropic` | `claude-sonnet-4-20250514` | ~$0.002 |
| `mistral` | `mistral-small-latest` | ~$0.001 |

## Diff Modes

### `commit` (default)
Diffs `HEAD~1..HEAD`. Use with `fetch-depth: 2`.

```yaml
- uses: actions/checkout@v4
  with:
    fetch-depth: 2
```

### `ref`
Diffs a custom base ref against HEAD. Use with `fetch-depth: 0`.

```yaml
- uses: actions/checkout@v4
  with:
    fetch-depth: 0

- uses: wvides/human-readable-post@v1
  with:
    provider: anthropic
    api_key: ${{ secrets.ANTHROPIC_API_KEY }}
    diff_mode: ref
    base_ref: ${{ github.event.before }}
```

### `tag`
Diffs between the two most recent tags. Use with `fetch-depth: 0`.

```yaml
- uses: actions/checkout@v4
  with:
    fetch-depth: 0
    fetch-tags: true

- uses: wvides/human-readable-post@v1
  with:
    provider: mistral
    api_key: ${{ secrets.MISTRAL_API_KEY }}
    diff_mode: tag
```

## Customization

### Language

```yaml
- uses: wvides/human-readable-post@v1
  with:
    provider: openai
    api_key: ${{ secrets.OPENAI_API_KEY }}
    language: spanish
```

### Custom Prompt

```yaml
- uses: wvides/human-readable-post@v1
  with:
    provider: openai
    api_key: ${{ secrets.OPENAI_API_KEY }}
    custom_prompt: "Focus on user-facing changes. Ignore dependency updates."
```

## License

MIT
