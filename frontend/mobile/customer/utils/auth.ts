export function getInitials(
    firstName: string,
    lastName: string
): string {
    const first =
        firstName.trim().charAt(0);

    const last =
        lastName.trim().charAt(0);

    if (first && last) {
        return `${first}${last}`.toUpperCase();
    }

    if (first) {
        return first.toUpperCase();
    }

    if (last) {
        return last.toUpperCase();
    }

    return "";
}