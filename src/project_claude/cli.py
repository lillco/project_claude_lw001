import argparse
import os
from anthropic import Anthropic


def greet(name: str) -> str:
    """Return greeting string for name."""
    return f"Hello, {name}!"


def chat_with_claude(prompt: str) -> str:
    """Send prompt to Claude and return response."""
    client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
    response = client.messages.create(
        model="claude-sonnet-4-5-20250929",
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}],
    )
    return response.content[0].text


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description="project-claude-lw001 CLI")
    parser.add_argument("--name", default="World", help="Name to greet")
    parser.add_argument("--prompt", help="Prompt to send to Claude")
    args = parser.parse_args(argv)
    
    if args.prompt:
        print(chat_with_claude(args.prompt))
    else:
        print(greet(args.name))
    
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
