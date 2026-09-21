namespace Backend;

public record ProductCreateDto(string Name, decimal Price, int Stock);
public record ProductUpdateDto(string Name, decimal Price, int Stock);