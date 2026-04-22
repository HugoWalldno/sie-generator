using Microsoft.AspNetCore.Mvc;
using SIEGenerator.API.Models;
using SIEGenerator.API.Services;

namespace SIEGenerator.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SIEController(SIEBuilderService builder) : ControllerBase
{
    [HttpPost("generate")]
    [Produces("application/json")]
    public ActionResult<SIEGenerationResult> Generate([FromBody] SIEGenerationRequest request)
    {
        if (request.SieType is not (1 or 4))
            return BadRequest("SieType must be 1 or 4.");

        var result = builder.Build(request);
        return Ok(result);
    }

    [HttpPost("download")]
    public IActionResult Download([FromBody] SIEGenerationRequest request)
    {
        if (request.SieType is not (1 or 4))
            return BadRequest("SieType must be 1 or 4.");

        var result = builder.Build(request);

        // SIE standard requires CP437 encoding
        System.Text.Encoding.RegisterProvider(System.Text.CodePagesEncodingProvider.Instance);
        var encoding = System.Text.Encoding.GetEncoding(437);
        var bytes = encoding.GetBytes(result.Content);

        return File(bytes, "application/octet-stream", result.Filename);
    }
}
