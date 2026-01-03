import argparse


def greet(name: str) -> str:
    """Return greeting string for name."""
    return f"Hello, {name}!"


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description="project-claude-lw001 CLI")
    parser.add_argument("--name", default="World", help="Name to greet")
    args = parser.parse_args(argv)
    print(greet(args.name))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
