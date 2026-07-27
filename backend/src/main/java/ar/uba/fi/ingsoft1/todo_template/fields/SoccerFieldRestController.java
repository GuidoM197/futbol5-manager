package ar.uba.fi.ingsoft1.todo_template.fields;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springdoc.api.annotations.ParameterObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Pageable;

import java.util.List;

@RestController
@RequestMapping("/soccer-fields")
@Tag(name = "3 - SoccerFields")
public class SoccerFieldRestController {
    private final SoccerFieldService soccerFieldService;

    @Autowired
    public SoccerFieldRestController(SoccerFieldService soccerFieldService) {
        this.soccerFieldService = soccerFieldService;
    }

    @PostMapping(value = "/create", produces = "application/json")
    @Operation(summary = "Create a new soccer field")
    @ResponseStatus(HttpStatus.CREATED)
    @ApiResponse(responseCode = "409", description = "Name already used", content = @Content)
    @ApiResponse(responseCode = "403", description = "Forbidden: Only owners can create fields", content = @Content)
    public ResponseEntity<SoccerField> createSoccerField(
            @Valid @RequestBody SoccerFieldCreateDTO dto,
            @AuthenticationPrincipal(expression = "username") String ownerEmail
    ) {
        System.out.println(ownerEmail);
        return soccerFieldService.createSoccerField(dto, ownerEmail)
                .map(sf -> ResponseEntity.status(HttpStatus.CREATED).body(sf))
                .orElse(ResponseEntity.status(HttpStatus.CONFLICT).build());
    }

    @GetMapping(value = "/search-by-location", produces = "application/json")
    @Operation(summary = "Search soccer fields by location")
    @ResponseStatus(HttpStatus.OK)
    @ApiResponse(responseCode = "403", description = "Forbidden: Only users can make a reserve fields", content = @Content)
    public Page<SoccerField> searchSoccerField(
            @AuthenticationPrincipal(expression = "username") String email,
            @ParameterObject Pageable pageable
    ) {
        return soccerFieldService.searchSoccerFieldsByUserLocation(email, pageable);
    }
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER')")
    @GetMapping(value = "/my-fields", produces = "application/json")
    public List<SoccerField> getMyFields(@AuthenticationPrincipal(expression = "username") String email) {
        return soccerFieldService.getFieldsByManager(email);
    }

    @PreAuthorize("hasRole('OWNER')")
    @DeleteMapping(value = "/{id}")
    public ResponseEntity<Void> deleteField(@PathVariable Long id, @AuthenticationPrincipal(expression = "username") String email) {
        if (soccerFieldService.deleteFieldByOwner(id, email)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER')")
    @PutMapping(value = "/{id}", produces = "application/json")
    public ResponseEntity<SoccerField> updateField(@PathVariable Long id, @RequestBody SoccerFieldCreateDTO dto, @AuthenticationPrincipal(expression = "username") String email) {
        return soccerFieldService.updateFieldByAdmin(id, dto, email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.FORBIDDEN).build());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping(value = "/admin/{id}", produces = "application/json")
    public ResponseEntity<SoccerField> updateFieldAsAdmin(@PathVariable Long id, @RequestBody SoccerFieldCreateDTO dto, @AuthenticationPrincipal(expression = "username") String email) {
        return soccerFieldService.updateFieldByAdmin(id, dto, email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.FORBIDDEN).build());
    }

    @PreAuthorize("hasRole('OWNER')")
    @PutMapping(value = "/owner/{id}", produces = "application/json")
    public ResponseEntity<SoccerField> updateFieldAsOwner(@PathVariable Long id, @RequestBody SoccerFieldCreateDTO dto) {
        return soccerFieldService.updateFieldByOwner(id, dto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.FORBIDDEN).build());
    }
}