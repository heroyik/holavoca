export const getAvatarColor = (id: string) => {
    const colors = [
        '#FF9600', // Duo Orange
        '#1CB0F6', // Duo Blue
        '#58CC02', // Duo Green
        '#CE82FF', // Duo Purple
        '#EE5555', // Red
        '#FFC400', // Yellow
    ];
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

export const getInitial = (name?: string) => {
    if (!name) return 'E';
    return name.charAt(0).toUpperCase();
};
